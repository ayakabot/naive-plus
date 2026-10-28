import { computed, inject, type ComputedRef } from 'vue'
import { isPlainObject } from 'lodash-es'
import {
  npConfigProviderInjectionKey,
  type NpComponentOptions,
} from '../config-provider'
import { npLocaleInjectionKey, zhCN, type NpLocaleMessages } from '../locale'
import type { AnyObject } from '../types'

/**
 * 逐层合并对象，非普通对象（如函数、VNode、数组）直接覆盖
 */
const mergeLayers = (layers: unknown[]) => {
  let result: AnyObject | undefined
  layers.forEach(layer => {
    if (layer === undefined) return
    if (isPlainObject(layer)) {
      result = { ...(result ?? {}), ...(layer as AnyObject) }
      return
    }
    result = layer as AnyObject
  })
  return result
}

/**
 * 过滤对象中值为 `undefined` 的字段
 */
const omitUndefined = (source: AnyObject | undefined): AnyObject =>
  Object.fromEntries(
    Object.entries(source ?? {}).filter(([, value]) => value !== undefined)
  )

/**
 * 读取 np-config-provider 中某个组件的默认配置
 *
 * 适用于配置字段与组件 props 不同名（如 `NpForm` / `NpTable` 的 `option` 字段）的场景。
 *
 * @param componentName 组件名，对应 `NpComponentOptions` 的 key
 */
export const useConfigOptions = <K extends keyof NpComponentOptions>(
  componentName: K
): ComputedRef<NpComponentOptions[K] | undefined> => {
  const componentOptions = inject(npConfigProviderInjectionKey, undefined)
  return computed(() => componentOptions?.value?.[componentName])
}

/**
 * 读取 np-config-provider 注入的语言文案，未注入时回落到简体中文
 */
export const useLocale = (): ComputedRef<NpLocaleMessages> => {
  const locale = inject(npLocaleInjectionKey, undefined)
  return computed(() => locale?.value ?? zhCN)
}

/**
 * 合并组件 props、np-config-provider 配置与组件内置默认值
 *
 * 优先级：组件自身 props > np-config-provider > 组件内置默认值
 *
 * @param componentName 组件名，对应 `NpComponentOptions` 的 key
 * @param props 组件自身 props（`defineProps` 的结果）
 * @param defaults 组件内置默认值
 * @param mergeKeys 需要逐层合并（而非整体覆盖）的字段，例如透传 naive-ui 的 `props`
 */
export const useConfigProps = <T extends AnyObject>(
  componentName: keyof NpComponentOptions,
  props: T,
  defaults: Partial<T> = {},
  mergeKeys: (keyof T)[] = []
): ComputedRef<T> => {
  const config = useConfigOptions(componentName)

  return computed<T>(() => {
    // 过滤 undefined，保证「未传」的 prop 不会覆盖 provider 与内置默认值
    const providerProps = omitUndefined(config.value)
    const userProps = omitUndefined(props)

    const merged = { ...defaults, ...providerProps, ...userProps } as T

    mergeKeys.forEach(key => {
      const name = key as string
      const value = mergeLayers([
        (defaults as AnyObject)[name],
        providerProps[name],
        userProps[name],
      ])
      if (value !== undefined) {
        ;(merged as AnyObject)[name] = value
      }
    })

    return merged
  })
}
