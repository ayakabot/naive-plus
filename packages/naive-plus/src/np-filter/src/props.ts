import type { VNode, PropType, ExtractPropTypes } from 'vue'
import type { AsyncValue } from '../../types'

export interface NpFilterItemOption {
  icon?: VNode | (() => VNode)
  label: string | (() => VNode)
  value: string | number | boolean
}

export interface NpFilterItem {
  icon?: VNode | (() => VNode)
  label: string | (() => VNode)
  key: string
  multiple?: boolean
  searchable?: boolean
  options:
    | AsyncValue<NpFilterItemOption[]>
    | Array<{
        title: string | (() => VNode)
        options: AsyncValue<NpFilterItemOption[]>
      }>
}

export type NpFilterItems = NpFilterItem[]

export const npFilterProps = {
  params: {
    type: Object as PropType<Record<string, any>>,
    required: true as const,
  },
  items: {
    type: Array as PropType<NpFilterItems>,
    required: true as const,
  },
  trigger: {
    type: String as PropType<'click' | 'hover'>,
  },
  placement: {
    type: String as PropType<'left' | 'right'>,
  },
  onChange: {
    type: Function as PropType<(params: Record<string, any>) => void>,
    required: false as const,
  },
}

export type NpFilterProps = ExtractPropTypes<typeof npFilterProps>

/**
 * 组件内置默认值，可通过 np-config-provider 覆盖
 */
export const npFilterDefaults: Partial<NpFilterProps> = {
  trigger: 'click',
}

/**
 * `params` / `items`（数据）与 `onChange`（事件）不支持全局配置
 */
export type NpFilterConfigProps = Partial<
  Pick<NpFilterProps, 'trigger' | 'placement'>
>
