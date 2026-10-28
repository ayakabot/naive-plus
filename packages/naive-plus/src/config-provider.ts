import type { InjectionKey, Ref } from 'vue'
import type { NpButtonConfigProps } from './np-button/src/props'
import type { NpCellConfigProps } from './np-cell/src/props'
import type { NpCellGroupConfigProps } from './np-cell-group/src/props'
import type { NpCheckboxConfigProps } from './np-checkbox/src/props'
import type { NpFilterConfigProps } from './np-filter/src/props'
import type { NpFormConfigProps } from './np-form/src/interface'
import type { NpRadioConfigProps } from './np-radio/src/props'
import type { NpTableConfigProps } from './np-table/src/interface'
import type { NpUploadConfigProps } from './np-upload/src/props'

/**
 * 组件全局默认配置。
 *
 * key 为组件名（PascalCase，去掉 `Np` 前缀），value 为该组件 props 的局部覆盖。
 * 优先级：组件自身 props > np-config-provider > 组件内置默认值
 *
 * 仅开放「展示类」属性：内容、状态（如 `modelValue` / `checked`）、
 * 数据源（如 `options` / `items`）与事件回调（如 `onChange` / `click`）由使用场景决定，不在此开放。
 * 各组件具体开放哪些字段，见对应组件的 `NpXxxConfigProps` 类型。
 */
export interface NpComponentOptions {
  Button?: NpButtonConfigProps
  Cell?: NpCellConfigProps
  CellGroup?: NpCellGroupConfigProps
  Checkbox?: NpCheckboxConfigProps
  Filter?: NpFilterConfigProps
  Form?: NpFormConfigProps
  Radio?: NpRadioConfigProps
  Table?: NpTableConfigProps
  Upload?: NpUploadConfigProps
}

/**
 * `np-config-provider` 向后代组件注入 `component-options` 时使用的 key。
 * 使用 `Ref` 包裹，以便父级配置变化时子组件能响应式更新。
 */
export const npConfigProviderInjectionKey: InjectionKey<
  Ref<NpComponentOptions | undefined>
> = Symbol('np-config-provider')
