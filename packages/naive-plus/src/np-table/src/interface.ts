import type { VNode, VNodeChild } from 'vue'
import type {
  DataTableProps,
  OnUpdateCheckedRowKeys,
  TableBaseColumn,
} from 'naive-ui/es/data-table/src/interface'
import type { AnyObject, AsyncValue } from '../../types'
import type { DropdownOption, InputProps, PaginationProps } from 'naive-ui'
import type { NpFilterItem } from '../../np-filter'
import type { FormColumn, FormOption } from '../../np-form'

export type NTableColumn<T extends AnyObject = AnyObject> = TableBaseColumn<T>
// | TableSelectionColumn<T>
// | TableExpandColumn<T>

export type NTableColumnExt = NTableColumn & {
  display?: boolean
  key: string
  label: string
}

export type TableColumn<T extends AnyObject = AnyObject> = {
  key: string
  label: string
  /**
   * 自定义表格渲染
   * @param rowData 行数据
   * @param rowIndex 行序号
   * @returns VNode
   */
  render?: (rowData: any, rowIndex: number) => VNode
  /**
   * Naive Table Column Props 属性
   */
  props?: Omit<NTableColumn<T>, 'key' | 'title' | 'render' | 'type'>
  /**
   * 显隐
   */
  display?: boolean
  /**
   * 表单额外属性
   */
  formProps?: Partial<FormColumn<T>> & {
    addProps?: Partial<FormColumn<T>>
    editProps?: Partial<FormColumn<T>>
  }
}

export type TableFilter = NpFilterItem

export interface TableSearchOption {
  /**
   * 提交给 `api.fetch` 的查询参数名
   * @default 'keyword'
   */
  key?: string
  /**
   * 输入框占位文本
   * @default '请输入关键词搜索'
   */
  placeholder?: string
  /**
   * 输入框宽度
   * @default 220
   */
  width?: string | number
  /**
   * 是否可清空
   * @default true
   */
  clearable?: boolean
  /**
   * 输入防抖时间（毫秒），停止输入后自动触发搜索
   * @default 300
   */
  debounce?: number
  /**
   * 透传给 `n-input` 的其他属性
   */
  props?: InputProps
}

export type TableOperationOption = DropdownOption & {
  type?: 'edit' | 'del'
}

export type TableOperationOptions<T extends AnyObject = AnyObject> =
  | TableOperationOption[]
  | ((rowData: T, rowIndex: number) => TableOperationOption[])

export interface TableApiFetchResult<T extends AnyObject = AnyObject> {
  /**
   * 总条数
   */
  itemCount?: number
  /**
   * 数据列表
   */
  items: T[]
}

export interface TableSlotOption {
  /**
   * 顶部左侧内容，优先级高于组件的 headerLeft 插槽
   */
  headerLeft?: () => VNodeChild
  /**
   * 顶部右侧内容，优先级高于组件的 headerRight 插槽
   */
  headerRight?: () => VNodeChild
  /**
   * 底部左侧内容，优先级高于组件的 footerLeft 插槽
   */
  footerLeft?: () => VNodeChild
}

export interface NpTableInst {
  /**
   * 重新加载数据，会重置到第一页
   */
  reload: () => Promise<void>
  /**
   * 重新刷新当前页数据
   */
  refresh: () => Promise<void>
  /**
   * 绑定的查询参数，会作为 `queryParams` 传递给 `option.api.fetch`
   */
  params: Record<string, any>
}

export interface TableOption<T extends AnyObject = AnyObject> {
  api: {
    fetch: (
      pageParams: {
        page: number
        pageSize: number
      },
      queryParams: Record<string, any>
    ) => TableApiFetchResult<T> | Promise<TableApiFetchResult<T>>

    add?: (rowData: T) => AsyncValue<T | boolean | void>
    edit?: (rowData: T) => AsyncValue<T | boolean | void>
    del?: (rowData: T) => AsyncValue<T | boolean | void>
  }

  rowKey?: string
  props?: Omit<
    DataTableProps,
    | 'columns'
    | 'pagination'
    | 'data'
    | 'loading'
    | 'rowKey'
    | 'onUpdateCheckedRowKeys'
  > & {}

  selection?:
    | boolean
    | {
        multiple?: boolean
        disabled?: (rowData: T) => boolean
        onChange?: OnUpdateCheckedRowKeys
      }

  formProps?: FormOption['props']

  operation?:
    | false
    | (Omit<NTableColumn<T>, 'key' | 'title' | 'render' | 'type'> & {
        label?: string
        prefixRender?: (
          rowData: T,
          rowIndex: number
        ) => VNode | VNode[] | undefined
        suffixRender?: (
          rowData: T,
          rowIndex: number
        ) => VNode | VNode[] | undefined

        options?: TableOperationOptions<T>
        onSelect?: (key: string, rowData: T, rowIndex: number) => void | boolean

        onBefore?: (
          rowData: T,
          type: 'add' | 'edit' | 'del'
        ) => boolean | T | void | Promise<boolean | T | void>
      })

  pagination?:
    | false
    | {
        defaultPage?: PaginationProps['defaultPage']
        defaultPageSize?: PaginationProps['defaultPageSize']
        displayOrder?: PaginationProps['displayOrder']
        goto?: PaginationProps['goto']
        to?: PaginationProps['to']
        pageSizes?: PaginationProps['pageSizes']
        selectProps?: PaginationProps['selectProps']
        showQuickJumper?: PaginationProps['showQuickJumper']
        simple?: PaginationProps['simple']
        showSizePicker?: PaginationProps['showSizePicker']
        showQuickJumpDropdown?: PaginationProps['showQuickJumpDropdown']
        prefix?: PaginationProps['prefix']
        suffix?: PaginationProps['suffix']
        prev?: PaginationProps['prev']
        next?: PaginationProps['next']
      }
  columns: TableColumn<T>[]
  filters?: NpFilterItem[]
  /**
   * 搜索框配置，不传或为 `false` 时不显示
   */
  search?: false | TableSearchOption
  slots?: TableSlotOption
}
