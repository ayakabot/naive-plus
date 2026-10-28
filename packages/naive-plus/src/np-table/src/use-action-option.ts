import { h } from 'vue'
import { NText, type DropdownOption } from 'naive-ui'
import { isFunction } from '../../utils'
import { zhCN } from '../../locale'
import type {
  TableOperationDefaultOptions,
  TableOperationOption,
  TableOperationOptions,
} from './interface'

/**
 * 内置操作项类型
 */
const OPERATION_TYPES = ['edit', 'del'] as const

/**
 * 按文案生成内置的编辑 / 删除操作项，删除项保留 error 文字样式
 * @param texts 编辑 / 删除项的文字
 */
export const createOperationDefaults = (texts: {
  editLabel: string
  delLabel: string
}): TableOperationDefaultOptions => ({
  edit: { label: texts.editLabel, key: 'edit' },
  del: {
    label: () => h(NText, { type: 'error' }, { default: () => texts.delLabel }),
    key: 'delete',
  },
})

/**
 * 逐项合并内置操作项的默认配置，未覆盖的字段（如 `key`）保留内置值
 * @param sources 按优先级从低到高排列的默认配置
 */
export const mergeOperationDefaults = (
  ...sources: (TableOperationDefaultOptions | undefined)[]
): TableOperationDefaultOptions => {
  const merged: TableOperationDefaultOptions = {}

  OPERATION_TYPES.forEach(type => {
    const item = Object.assign({}, ...sources.map(source => source?.[type]))

    if (Object.keys(item).length) {
      merged[type] = item
    }
  })

  return merged
}

/**
 * 内置默认操作项（简体中文），实际文案由 np-config-provider 的 locale 决定
 */
const DEFAULT_OPERATION_OPTIONS = createOperationDefaults({
  editLabel: zhCN.Table.operation.editLabel,
  delLabel: zhCN.Table.operation.delLabel,
})

const DEFAULT_OPERATION_TYPES: TableOperationOption[] = OPERATION_TYPES.map(
  type => ({ type })
)

export const buildOperationOptions = (
  options?: TableOperationOptions,
  rowData: Record<string, any> = {},
  rowIndex = 0,
  defaultOptions?: TableOperationDefaultOptions
): DropdownOption[] => {
  const userOptions = isFunction(options) ? options(rowData, rowIndex) : options
  const sourceOptions = userOptions?.length
    ? userOptions
    : DEFAULT_OPERATION_TYPES
  // 传入的默认配置逐项合并到内置默认值，避免只覆盖文案时丢失 key 等字段
  const defaults = mergeOperationDefaults(
    DEFAULT_OPERATION_OPTIONS,
    defaultOptions
  )

  return sourceOptions.map(option => {
    const { type, ...rest } = option
    if (type !== 'edit' && type !== 'del') return rest
    return { ...defaults[type], ...rest }
  })
}
