import type { ExtractPropTypes, PropType } from 'vue'
import { makeStringProp } from '../../utils'
import type { AsyncValue } from '../../types'
import type { CheckboxGroupProps } from 'naive-ui'

export type CheckboxValue = string | number
export type CheckboxGroupValue = Array<CheckboxValue>
export interface CheckboxOption {
  label: string
  value: CheckboxValue
}
export const npCheckboxProps = {
  modelValue: {
    type: Array as PropType<CheckboxGroupValue>,
    required: false,
    default: () => {
      return []
    },
  },
  options: {
    type: [Object, Function] as PropType<
      AsyncValue<Array<CheckboxOption | any>>
    >,
  },
  labelField: makeStringProp('label'),
  valueField: makeStringProp('value'),
  /**
   * 点击加载延迟 ms
   * @defaultValue 250
   */
  loadingDelay: {
    type: Number,
  },
  /**
   * 原 t-checkbox-group 属性
   */
  props: {
    type: Object as PropType<
      Omit<
        CheckboxGroupProps,
        'value' | 'onUpdate:value' | 'onUpdateValue' | 'onChange'
      >
    >,
  },
  /**
   * 改变事件
   */
  onChange: {
    type: Function as PropType<(value: CheckboxGroupValue) => void>,
  },
}

export type NpCheckboxProps = ExtractPropTypes<typeof npCheckboxProps>

/**
 * 组件内置默认值，可通过 np-config-provider 覆盖
 */
export const npCheckboxDefaults: Partial<NpCheckboxProps> = {
  loadingDelay: 250,
}

/**
 * `modelValue`（状态）、`options` / `labelField` / `valueField`（数据）
 * 与 `onChange`（事件）不支持全局配置
 */
export type NpCheckboxConfigProps = Partial<
  Pick<NpCheckboxProps, 'loadingDelay' | 'props'>
>
