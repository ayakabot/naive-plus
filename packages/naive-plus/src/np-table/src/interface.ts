import type { VNode, VNodeChild } from 'vue'
import type {
  DataTableProps,
  OnUpdateCheckedRowKeys,
  TableBaseColumn,
} from 'naive-ui/es/data-table/src/interface'
import type { AnyObject, AsyncValue } from '../../types'
import type { DropdownOption, PaginationProps } from 'naive-ui'
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
  render?: (rowData: any, rowIndex: number) => VNode
  props?: Omit<NTableColumn<T>, 'key' | 'title' | 'render' | 'type'>
  display?: boolean
  formProps?: Partial<FormColumn<T>> & {
    addProps?: Partial<FormColumn<T>>
    editProps?: Partial<FormColumn<T>>
  }
}

export type TableFilter = NpFilterItem

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
  slots?: TableSlotOption
}
