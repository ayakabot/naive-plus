import type { PropType, ExtractPropTypes } from 'vue'
import type { CustomVNode } from '../../types'

export type NpCellGroupKey = number | string | boolean
export type NpCellGroupKeys = NpCellGroupKey[]

export interface NpCellGroupOption {
  key?: NpCellGroupKey
  label: string | CustomVNode
  icon?: CustomVNode
  value?: string | CustomVNode
  description?: string | CustomVNode
  footer?: CustomVNode
  hover?: boolean
  arrow?: boolean
  onClick?: () => void
}

export const npCellGroupProps = {
  keys: {
    type: Array as PropType<NpCellGroupKeys>,
    default: () => [],
  },
  title: {
    type: String,
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
  },
  type: {
    type: String as PropType<'checkbox' | 'radio' | 'switch'>,
  },
  bordered: {
    type: Boolean,
    // default: undefined 可关闭 Vue 对 Boolean prop 的默认值转换（未传时不会变成 false）
    default: undefined,
  },
  options: {
    type: Array as PropType<NpCellGroupOption[]>,
    default: () => [],
  },
}

export type NpCellGroupProps = ExtractPropTypes<typeof npCellGroupProps>

/**
 * 组件内置默认值，可通过 np-config-provider 覆盖
 */
export const npCellGroupDefaults: Partial<NpCellGroupProps> = {
  size: 'medium',
  bordered: false,
}

/**
 * `keys`（状态）、`options` / `title`（数据与内容）与 `type`（控件类型）
 * 不支持全局配置
 */
export type NpCellGroupConfigProps = Partial<
  Pick<NpCellGroupProps, 'size' | 'bordered'>
>
