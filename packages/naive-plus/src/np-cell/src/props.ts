import type { PropType, ExtractPropTypes } from 'vue'
import type { CustomVNode } from '../../types'

export const npCellProps = {
  type: {
    type: String as PropType<'checkbox' | 'radio' | 'switch'>,
  },
  hover: {
    type: Boolean,
    default: undefined,
  },
  checked: {
    type: Boolean,
    // default: undefined 可关闭 Vue 对 Boolean prop 的默认值转换（未传时不会变成 false）
    default: undefined,
  },
  icon: {
    type: [Object, Function] as PropType<CustomVNode>,
  },
  label: {
    type: [String, Object, Function] as PropType<string | CustomVNode>,
    required: true as const,
  },
  value: {
    type: [String, Object, Function] as PropType<string | CustomVNode>,
  },
  description: {
    type: [String, Object, Function] as PropType<string | CustomVNode>,
  },
  footer: {
    type: [Object, Function] as PropType<CustomVNode>,
  },
  arrow: {
    type: Boolean,
    default: undefined,
  },
  bordered: {
    type: Boolean,
    default: undefined,
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
  },
}

export type NpCellProps = ExtractPropTypes<typeof npCellProps>

/**
 * 组件内置默认值，可通过 np-config-provider 覆盖
 */
export const npCellDefaults: Partial<NpCellProps> = {
  checked: false,
  arrow: false,
  bordered: false,
  size: 'medium',
}

/**
 * 仅开放展示类属性。内容（label/value/description/icon/footer）、
 * 状态（checked）与控件类型（type）由使用场景决定，不支持全局配置
 */
export type NpCellConfigProps = Partial<
  Pick<NpCellProps, 'hover' | 'arrow' | 'bordered' | 'size'>
>
