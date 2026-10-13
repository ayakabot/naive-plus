import { computed, defineComponent, onMounted, ref, renderSlot } from 'vue'
import { useCreate } from '../../_hooks/create'
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
  TableSlotOption,
} from './interface'
import IconAdd from './icon/add.vue'
import { sanitizeTableProps } from './use-table-props'
import { useCrud } from './use-crud'

const { name, bemClass } = useCreate('np-table')

/**
 * loading 展示延迟，避免请求过快时闪烁
 */
const LOADING_DELAY = 250

export default defineComponent({
  name,
  props: npTableProps,
  setup(props, { expose, slots }) {
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
     * 表格 columns
     */
    const columns = ref<NTableColumnExt[]>([])

    /**
     * 请求序号，仅接受最新一次请求的响应，避免过期响应覆盖新数据
     */
    let fetchVersion = 0

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

    const resetColumn = () => {
      columns.value = props.option.columns
        .map(item => ({
          ...item,
          ...item.props,
          title: item.label,
          display: item.display !== false,
        }))
        .filter(item => item.display)
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
    } = useCrud(() => props.option, fetchData)

    onMounted(() => {
      resetColumn()
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
      const mergedProps = sanitizeTableProps(props.option.props)

      return {
        rowKey: (item: Record<string, any>): string | number => {
          return item[props.option.rowKey || 'id']
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
        // onBefore 由 useCrud 消费，这里复制 operation 并移除该字段，避免误传给列对象
        const operation: Record<string, any> = {
          ...(props.option.operation ?? {}),
        }
        delete operation.onBefore

        list.push({
          width: 80,
          ...operation,
          title: operation.label ?? '',
          key: '__np_table_operation',
          render(rowData, rowIndex) {
            return (
              <NpTableAction
                rowData={rowData}
                rowIndex={rowIndex}
                options={operation.options}
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
                  default: () => <span>添加</span>,
                }}
              </NButton>
            )}
            <IconButtonGroup
              filters={props.option.filters}
              columns={columns.value}
              onUpdate:columns={next => (columns.value = next)}
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
        />

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
          formProps={props.option.formProps}
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
