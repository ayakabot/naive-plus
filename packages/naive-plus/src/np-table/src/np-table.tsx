import { computed, defineComponent, onMounted, ref, renderSlot } from 'vue'
import { useCreate } from '../../_hooks/create'
import { useConfigOptions, useLocale } from '../../_hooks/config'
import { npTableProps } from './props'
import {
  NButton,
  NDataTable,
  NIcon,
  NPagination,
  type DataTableProps,
  type PaginationProps,
} from 'naive-ui'
import { isFunction, isObject } from '../../utils'
import IconButtonGroup from './np-table-header/icon-button-group.vue'
import NpTableSearch from './np-table-header/search-input.vue'
import NpTableAction from './np-table-action'
import NpTableCrudDialog from './components/np-table-crud-dialog.vue'
import NpTableDelDialog from './components/np-table-del-dialog.vue'
import type {
  NTableColumn,
  NTableColumnExt,
  TableOperationDefaultOptions,
  TableSlotOption,
} from './interface'
import IconAdd from './icon/add.vue'
import { sanitizeTableProps } from './use-table-props'
import { useCrud } from './use-crud'
import {
  createOperationDefaults,
  mergeOperationDefaults,
} from './use-action-option'

const { name, bemClass } = useCreate('np-table')

/**
 * loading 展示延迟，避免请求过快时闪烁
 */
const LOADING_DELAY = 250

export default defineComponent({
  name,
  props: npTableProps,
  setup(props, { expose, slots }) {
    /** np-config-provider 中的 Table 默认配置 */
    const config = useConfigOptions('Table')
    /** np-config-provider 注入的文案 */
    const locale = useLocale()
    const loading = ref(false)
    const page = ref((props.option.pagination || {}).defaultPage || 1)
    const pageSize = ref((props.option.pagination || {}).defaultPageSize || 10)
    const itemCount = ref(0)
    const data = ref<any[]>([])
    const queryParams = ref<Record<string, any>>({})
    /**
     * 搜索框提交的查询参数，与筛选参数合并后传递给 api.fetch
     */
    const searchParams = ref<Record<string, any>>({})
    /**
     * 外部绑定的查询参数，会与筛选参数合并后传递给 api.fetch
     */
    const params = ref<Record<string, any>>({})
    /**
     * 列显隐的运行时覆盖，key 为列 key，值为是否显示
     */
    const columnDisplay = ref<Record<string, boolean>>({})
    /**
     * 表格 columns，合并 np-config-provider 中的列默认配置；
     * 只排除配置层显式隐藏（display: false）的列，运行时隐藏的列仍保留，
     * 以便在「显示设置」中重新开启
     */
    const columns = computed<NTableColumnExt[]>(() =>
      props.option.columns
        .filter(item => item.display !== false)
        .map(item => ({
          ...config.value?.column?.props,
          ...item,
          ...item.props,
          title: item.label,
          display: columnDisplay.value[item.key] ?? true,
        }))
    )

    /**
     * 合并列显隐设置，显隐状态不再依赖 columns 对象本身，保证 provider 配置变化时不会丢失；
     * 合并而非整体替换，避免未出现在列表中的列显隐记录被丢弃
     */
    const handleUpdateColumns = (next: NTableColumnExt[]) => {
      columnDisplay.value = {
        ...columnDisplay.value,
        ...Object.fromEntries(
          next.map(item => [item.key, item.display !== false])
        ),
      }
    }

    /**
     * 操作列配置，`false` 表示不渲染操作列
     */
    const operationOption = computed(() =>
      props.option.operation === false ? undefined : props.option.operation
    )

    /**
     * 内置编辑 / 删除操作项的默认配置
     * 优先级：语言包文案 < provider 配置 < option 配置
     */
    const operationDefaultOptions = computed<TableOperationDefaultOptions>(
      () => {
        const { editLabel, delLabel } = locale.value.Table.operation
        return mergeOperationDefaults(
          createOperationDefaults({ editLabel, delLabel }),
          config.value?.operation?.defaultOptions,
          operationOption.value?.defaultOptions
        )
      }
    )

    /**
     * 请求序号，仅接受最新一次请求的响应，避免过期响应覆盖新数据
     */
    let fetchVersion = 0
    /**
     * 是否已完成首次请求，完成前既不展示空状态也不展示 loading
     */
    const fetched = ref(false)

    const fetchData = async () => {
      if (!isFunction(props.option.api?.fetch)) {
        return
      }

      const version = ++fetchVersion
      const loadingTimer = setTimeout(() => {
        // 期间已发出更新的请求，交由最新请求展示 loading
        if (version === fetchVersion) {
          loading.value = true
        }
      }, LOADING_DELAY)
      try {
        const result = await props.option.api.fetch(
          { page: page.value, pageSize: pageSize.value },
          { ...queryParams.value, ...searchParams.value, ...params.value }
        )
        // 期间已发出更新的请求，丢弃本次过期响应
        if (version !== fetchVersion) {
          return
        }
        data.value = result.items || []
        if (result.itemCount !== undefined) {
          itemCount.value = result.itemCount
        }
      } finally {
        clearTimeout(loadingTimer)
        // 仅最新请求结束才关闭 loading，避免过期请求提前关闭
        if (version === fetchVersion) {
          loading.value = false
          fetched.value = true
        }
      }
    }

    /**
     * 重新刷新当前页数据
     */
    const refresh = () => fetchData()

    /**
     * 重新加载数据，会重置到第一页
     */
    const reload = () => {
      page.value = 1
      return fetchData()
    }

    const {
      dialogVisible,
      delVisible,
      crudMode,
      formData,
      dialogLoading,
      delLoading,
      delRow,
      openAction,
      handleSubmit,
      handleDel,
    } = useCrud(
      () => props.option,
      fetchData,
      () => config.value?.column?.formProps
    )

    onMounted(() => {
      fetchData()
    })

    expose({ reload, refresh, params })

    const pagination = computed<PaginationProps | false>(() => {
      if (props.option.pagination === false) {
        return false
      }
      return {
        pageSizes: [10, 20, 50, 100],
        showSizePicker: true,
        showQuickJumper: false,
        showQuickJumpDropdown: true,
        pageSlot: 5,
        ...props.option.pagination,
        page: page.value,
        pageSize: pageSize.value,
        itemCount: itemCount.value,
        onUpdatePage: (newPage: number) => {
          page.value = newPage
          fetchData()
        },
        onUpdatePageSize: (newPageSize: number) => {
          pageSize.value = newPageSize
          page.value = 1
          fetchData()
        },
      }
    })

    const tableProps = computed<DataTableProps>(() => {
      const mergedProps = sanitizeTableProps({
        ...config.value?.props,
        ...props.option.props,
      })

      return {
        rowKey: (item: Record<string, any>): string | number => {
          return item[props.option.rowKey ?? config.value?.rowKey ?? 'id']
        },
        bordered: false,
        remote: true,
        ...mergedProps,
        onUpdateCheckedRowKeys: (keys, rows, meta) => {
          if (isObject(props.option.selection)) {
            props.option.selection?.onChange?.(keys, rows, meta)
          }
        },
      }
    })

    const handleFilterChange = (val: Record<string, any>) => {
      queryParams.value = {
        ...val,
      }
      page.value = 1
      fetchData()
    }

    /**
     * 搜索框配置，`false` 或未配置时不渲染
     */
    const searchOption = computed(() => props.option.search || undefined)

    const handleSearchChange = (value?: string) => {
      const key = searchOption.value?.key ?? 'keyword'
      searchParams.value = value ? { [key]: value } : {}
      page.value = 1
      fetchData()
    }

    const displayColumns = computed<NTableColumn[]>(() => {
      const list: NTableColumn[] = columns.value.filter(item => item.display)

      if (props.option.selection) {
        let selectionColumn: any
        if (isObject(props.option.selection)) {
          selectionColumn = {
            type: 'selection',
            key: '__np_table_selection',
            ...props.option.selection,
          }
        } else {
          selectionColumn = { type: 'selection', key: '__np_table_selection' }
        }
        list.splice(0, 0, selectionColumn)
      }
      if (props.option.operation !== false) {
        // provider 中的列属性（如 width / align / fixed）作为操作列默认值，
        // option.operation 中的同名属性优先级更高；
        // onBefore / defaultOptions 由组件内部消费，这里移除，避免误传给列对象
        const operation: Record<string, any> = {
          ...(config.value?.operation ?? {}),
          ...(props.option.operation ?? {}),
        }
        delete operation.onBefore
        delete operation.defaultOptions

        list.push({
          width: 80,
          ...operation,
          title: operation.label ?? locale.value.Table.operation.label,
          key: '__np_table_operation',
          render(rowData, rowIndex) {
            return (
              <NpTableAction
                rowData={rowData}
                rowIndex={rowIndex}
                options={operation.options}
                defaultOptions={operationDefaultOptions.value}
                prefixRender={operation.prefixRender}
                suffixRender={operation.suffixRender}
                onSelect={key => {
                  if (key === 'edit') {
                    openAction('edit', rowData)
                  } else if (key === 'delete') {
                    openAction('del', rowData)
                  } else {
                    operation.onSelect?.(key, rowData, rowIndex)
                  }
                }}
              />
            )
          },
        })
      }

      return list
    })

    const renderOptionSlot = (name: keyof TableSlotOption) => {
      const optionSlot = props.option.slots?.[name]
      return optionSlot ? optionSlot() : renderSlot(slots, name)
    }

    /**
     * 首次请求完成前用空白占位代替空状态，避免加载期间闪现「暂无数据」；
     * 返回空数组时交给 naive-ui 渲染默认空状态
     */
    const renderEmpty = () => {
      if (!fetched.value) {
        return [<div class={`${bemClass.value}__empty-placeholder`} />]
      }
      return []
    }

    return () => (
      <div class={bemClass.value}>
        <div class={`${bemClass.value}__header`}>
          <div class={`${bemClass.value}__header-left`}>
            {searchOption.value ? (
              <NpTableSearch
                option={searchOption.value}
                onChange={handleSearchChange}
              />
            ) : undefined}
            {renderOptionSlot('headerLeft')}
          </div>
          <div class={`${bemClass.value}__header-right`}>
            {renderOptionSlot('headerRight')}
            {props.option.operation !== false && props.option.api?.add && (
              <NButton type="primary" onClick={() => openAction('add')}>
                {{
                  icon: () => (
                    <NIcon>
                      <IconAdd></IconAdd>
                    </NIcon>
                  ),
                  default: () => <span>{locale.value.Table.addBtnText}</span>,
                }}
              </NButton>
            )}
            <IconButtonGroup
              filters={props.option.filters}
              columns={columns.value}
              onUpdate:columns={handleUpdateColumns}
              onRefresh={fetchData}
              onFilterChange={handleFilterChange}
            ></IconButtonGroup>
          </div>
        </div>

        <NDataTable
          {...tableProps.value}
          loading={loading.value}
          columns={displayColumns.value}
          data={data.value}
        >
          {{ empty: renderEmpty }}
        </NDataTable>

        <div class={`${bemClass.value}__footer`}>
          <div class={`${bemClass.value}__footer-left`}>
            {renderOptionSlot('footerLeft')}
          </div>
          {pagination.value ? (
            <NPagination {...pagination.value}></NPagination>
          ) : undefined}
        </div>

        <NpTableCrudDialog
          visible={dialogVisible.value}
          mode={crudMode.value}
          columns={props.option.columns}
          modelValue={formData.value}
          loading={dialogLoading.value}
          formProps={{ ...config.value?.formProps, ...props.option.formProps }}
          columnFormProps={config.value?.column?.formProps}
          onUpdate:visible={(val: boolean) => (dialogVisible.value = val)}
          onUpdate:modelValue={(val: Record<string, any>) =>
            (formData.value = val)
          }
          onSubmit={handleSubmit}
        />

        <NpTableDelDialog
          visible={delVisible.value}
          row={delRow.value}
          loading={delLoading.value}
          onUpdate:visible={(val: boolean) => (delVisible.value = val)}
          onConfirm={handleDel}
        />
      </div>
    )
  },
})
