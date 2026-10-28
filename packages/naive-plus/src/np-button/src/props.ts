import type { ButtonProps } from 'naive-ui'
import type { CSSProperties, ExtractPropTypes, PropType } from 'vue'

export const npButtonProps = {
  /**
   * 增强点击事件
   */
  click: {
    type: [Function, Promise] as PropType<
      ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<void>)
    >,
  },
  /**
   * 点击加载延迟 ms，当使用 `:click` 代替 `@click` 时有效
   * @defaultValue 250
   */
  loadingDelay: {
    type: Number,
  },
  /**
   * 节流延迟 ms
   * @defaultValue 350
   */
  throttleDelay: {
    type: Number,
  },
  /**
   * 主题
   * @defaultValue default
   */
  type: {
    type: String as PropType<
      'default' | 'primary' | 'warning' | 'success' | 'info' | 'error'
    >,
  },
  /**
   * 原 t-button 属性
   */
  props: {
    type: Object as PropType<Omit<ButtonProps, 'type' | 'onClick'>>,
  },
  style: {
    type: Object as PropType<CSSProperties>,
  },
  /**
   * 默认点击事件
   */
  onClick: Function as PropType<(e: MouseEvent) => void>,
}

export type NpButtonProps = ExtractPropTypes<typeof npButtonProps>

/**
 * 组件内置默认值，可通过 np-config-provider 覆盖
 */
export const npButtonDefaults: Partial<NpButtonProps> = {
  loadingDelay: 250,
  throttleDelay: 350,
  type: 'default',
}

/**
 * `click` / `onClick` 属于使用组件时的业务行为，不支持全局配置
 */
export type NpButtonConfigProps = Partial<
  Omit<NpButtonProps, 'click' | 'onClick'>
>
