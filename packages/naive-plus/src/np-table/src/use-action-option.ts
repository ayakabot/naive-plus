import { h } from 'vue'
import { NText, type DropdownOption } from 'naive-ui'
import { isFunction } from '../../utils'
import type { TableOperationOption, TableOperationOptions } from './interface'

const DEFAULT_OPERATION_OPTIONS: Record<'edit' | 'del', DropdownOption> = {
  edit: { label: '编辑', key: 'edit' },
  del: {
    label: () => h(NText, { type: 'error' }, { default: () => '删除' }),
    key: 'delete',
  },
}

const DEFAULT_OPERATION_TYPES: TableOperationOption[] = [
  { type: 'edit' },
  { type: 'del' },
]

export const buildOperationOptions = (
  options?: TableOperationOptions,
  rowData: Record<string, any> = {},
  rowIndex = 0
): DropdownOption[] => {
  const userOptions = isFunction(options) ? options(rowData, rowIndex) : options
  const sourceOptions = userOptions?.length
    ? userOptions
    : DEFAULT_OPERATION_TYPES

  return sourceOptions.map(option => {
    const { type, ...rest } = option
    if (type !== 'edit' && type !== 'del') return rest
    return { ...DEFAULT_OPERATION_OPTIONS[type], ...rest }
  })
}
