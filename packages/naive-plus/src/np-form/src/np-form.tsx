import {
  computed,
  defineComponent,
  getCurrentInstance,
  provide,
  reactive,
  ref,
  watch,
  type StyleValue,
} from 'vue'
import { useCreate } from '../../_hooks/create'
import { useConfigOptions, useLocale } from '../../_hooks/config'
import { npFormProps } from './props'
import {
  NForm,
  NFormItemGi,
  NGi,
  NGrid,
  NSpin,
  type ButtonProps,
  type FormInst,
} from 'naive-ui'
import NpFormItem from './np-form-item'
import type {
  FormColumn,
  FormInjection,
  FormOption,
  NpFormColumnConfigProps,
  NpFormFooterConfigProps,
} from './interface'
import { getGridItemProps } from './grid'
import { cloneDeep, isEqual, omit, throttle } from 'lodash-es'
import NpButton from '../../np-button'
import type { AnyObject } from '../../types'
import { isFunction, runAsync } from '../../utils'
import EventBus from '../../utils/event-bus'

const { name, bemClass } = useCreate('np-form')

/**
 * 提取提交异常的错误信息，用于展示在底部表单项的校验反馈中
 * @param e 提交异常
 * @returns 错误信息，返回 undefined 表示不展示
 */
const getSubmitErrorMessage = (e: unknown): string | undefined => {
  if (e === undefined || e === null || e === false) {
    return undefined
  }
  const message =
    typeof e === 'string'
      ? e
      : (e as AnyObject)?.message ?? (e as AnyObject)?.msg
  return message ? String(message) : undefined
}

/**
 * 合并全局默认配置与表单项自身的配置，表单项自身的配置优先级更高
 * @param column 表单项
 * @param columnConfig np-config-provider 中的表单项默认配置
 * @returns 合并后的表单项
 */
const mergeFormColumn = (
  column: FormColumn,
  columnConfig?: NpFormColumnConfigProps
): FormColumn => {
  if (!columnConfig) {
    return column
  }
  return {
    ...column,
    // `defaultValue` 属于状态类字段，不支持全局配置，避免所有表单项被写入同一默认值
    props: {
      ...omit(columnConfig.props ?? {}, ['defaultValue']),
      ...column.props,
    },
    formItemProps: { ...columnConfig.formItemProps, ...column.formItemProps },
  } as FormColumn
}

type FooterButtonOptions = {
  text?: string
  props?: Omit<ButtonProps, 'onClick'>
}

/**
 * 合并底部按钮配置，底部自身传 `false` 表示不显示该按钮
 * @param base 全局默认配置
 * @param override 底部自身的配置
 * @returns 合并后的按钮配置
 */
const mergeFooterButton = <T extends FooterButtonOptions>(
  base: false | T | undefined,
  override: false | T | undefined
): false | T | undefined => {
  if (override === false) {
    return false
  }
  if (override === undefined) {
    return base
  }
  if (base === false || base === undefined) {
    return override
  }
  return { ...base, ...override, props: { ...base.props, ...override.props } }
}

/**
 * 合并全局默认配置与底部自身的配置，底部自身的配置优先级更高
 * @param footer 底部配置，`false` 表示隐藏整个底部
 * @param footerConfig np-config-provider 中的底部默认配置
 * @returns 合并后的底部配置
 */
const mergeFormFooter = (
  footer: FormOption['footer'],
  footerConfig?: NpFormFooterConfigProps
): FormOption['footer'] => {
  if (footer === false || !footerConfig) {
    return footer
  }
  return {
    ...footerConfig,
    ...footer,
    formItemProps: { ...footerConfig.formItemProps, ...footer?.formItemProps },
    style: { ...footerConfig.style, ...footer?.style },
    submitBtn: mergeFooterButton(footerConfig.submitBtn, footer?.submitBtn),
    resetBtn: mergeFooterButton(footerConfig.resetBtn, footer?.resetBtn),
  }
}

export default defineComponent({
  name,
  inheritAttrs: false,
  props: npFormProps,
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const injectKey = Symbol('np-form-inject-key')
    /** np-config-provider 中的 Form 默认配置 */
    const config = useConfigOptions('Form')
    /** np-config-provider 注入的文案 */
    const locale = useLocale()
    /**
     * 合并全局默认配置后的表单配置，`option` 中的同名配置优先级更高
     */
    const mergedOption = computed<FormOption>(() => {
      const option = props.option
      const formConfig = config.value
      return {
        ...option,
        enterSubmitMode: option.enterSubmitMode ?? formConfig?.enterSubmitMode,
        grid: { ...formConfig?.grid, ...option.grid },
        props: { ...formConfig?.props, ...option.props },
        footer: mergeFormFooter(option.footer, formConfig?.footer),
        columns: (option.columns || []).map(column =>
          mergeFormColumn(column, formConfig?.column)
        ),
      }
    })
    const data = ref<AnyObject>({})
    const backData = ref<AnyObject>({})
    const event = new EventBus<{
      'data-change': AnyObject
    }>()
    const vm = getCurrentInstance()
    const formRef = ref<FormInst>()
    const formExpose = (v: any) => {
      if (!v || formRef.value !== undefined) {
        return
      }
      formRef.value = v
      if (vm) {
        // @ts-ignore
        vm.exposed = Object.assign(
          v,
          // 额外暴露的方法
          {
            submit,
            reset,
            validateFields: async (fields: string | string[]) => {
              const fieldsArr = typeof fields === 'string' ? [fields] : fields
              await formRef.value?.validate(
                () => {},
                rule => {
                  if (!rule.key) {
                    return false
                  }
                  // 直接等于
                  if (fieldsArr.includes(rule.key)) {
                    return true
                  }
                  // 包含前缀
                  const findIdx = fieldsArr.findIndex(
                    field => rule.key?.startsWith(`${field}__`)
                  )
                  return findIdx >= 0
                }
              )
            },
          }
        )
      }
    }

    const loading = ref(false)
    /** 底部按钮所在表单项的校验反馈（提交异常时展示） */
    const footerFeedback = ref<string>()
    const footerValidationStatus = ref<'error' | 'success' | 'warning'>()
    const submitErrorFeedbackEnabled = computed(
      () =>
        mergedOption.value.footer !== false &&
        mergedOption.value.footer?.submitErrorFeedback !== false
    )

    const clearFooterFeedback = () => {
      if (footerFeedback.value !== undefined) {
        footerFeedback.value = undefined
        footerValidationStatus.value = undefined
      }
    }

    watch(
      data,
      throttle(() => {
        emit('update:modelValue', data.value)
        event.emit('data-change', data.value)
      }, 100),
      { deep: true }
    )

    const initDefaultValue = (val: AnyObject = {}) => {
      backData.value = cloneDeep(val)
      mergedOption.value.columns?.forEach(column => {
        const key = column.key || '_unknown'
        if (
          column.defaultValue !== undefined &&
          backData.value[key] === undefined
        ) {
          backData.value[key] = column.defaultValue
        } else if (
          column.props?.defaultValue !== undefined &&
          backData.value[key] === undefined
        ) {
          backData.value[key] = column.props.defaultValue
        }
      })
      data.value = cloneDeep(backData.value)
    }

    initDefaultValue(props.modelValue)

    /**
     * 栅格配置
     * - 默认开启 `itemResponsive`，使 `span` / `offset` 的响应式写法开箱即用
     */
    const gridConfig = computed(() => ({
      itemResponsive: true,
      ...mergedOption.value.grid,
    }))

    watch(
      () => props.modelValue,
      throttle(val => {
        if (!isEqual(data.value, val)) {
          initDefaultValue(val)
        }
        clearFooterFeedback()
      }, 100),
      { deep: true, immediate: false }
    )

    const submit = async () => {
      if (loading.value) {
        return
      }
      loading.value = true
      clearFooterFeedback()
      try {
        await formRef.value?.validate()
      } catch {
        loading.value = false
        return
      }
      try {
        await runAsync(props.option.onSubmit, data.value)
      } catch (e) {
        // 提交异常时，将错误信息展示在底部按钮所在表单项上
        if (submitErrorFeedbackEnabled.value) {
          const message = getSubmitErrorMessage(e)
          if (message !== undefined) {
            footerFeedback.value = message
            footerValidationStatus.value = 'error'
          }
        }
      } finally {
        loading.value = false
      }
    }

    const reset = async () => {
      clearFooterFeedback()
      formRef.value?.restoreValidation()
      data.value = cloneDeep(backData.value)
      await runAsync(props.option.onReset, data.value)
    }

    provide<FormInjection>(injectKey, {
      data,
      // 注入合并后的配置，使 np-form-item 能读取到全局默认值（如 enterSubmitMode / grid）
      props: reactive({ option: mergedOption }),
      injectKey,
      event,
      submit,
    })

    /**
     * 最后一个实际渲染的表单项索引（跳过 render 列与 display 为 false 的列）
     * 用于 enterSubmitMode === 'last' 时判断回车是否提交
     */
    const lastItemIdx = computed(() => {
      const columns = mergedOption.value.columns || []
      for (let i = columns.length - 1; i >= 0; i--) {
        const column = columns[i]
        if (typeof column.render !== 'function' && column.display !== false) {
          return i
        }
      }
      return -1
    })

    const footer = () => {
      if (mergedOption.value.footer === false) {
        return undefined
      }

      const {
        prefixRender,
        suffixRender,
        submitBtn = {},
        resetBtn = {},
        style = {},
        align = 'left',
        formItemProps,
      } = mergedOption.value.footer || {}

      /** 按钮文案：footer 自身配置 > 语言包 */
      const footerText = locale.value.Form.footer

      const isAlignRight = align === 'right'

      const defaultStyle: StyleValue = {
        width: '100%',
        display: 'flex',
        flexDirection: isAlignRight ? 'row-reverse' : 'row',
        justifyContent: isAlignRight ? 'end' : 'start',
        alignItems: 'center',
        gap: '16px',
        ...style,
      }

      /** 右对齐时校验反馈信息同步靠右 */
      const feedbackStyle = isAlignRight
        ? {
            textAlign: 'end' as const,
            ...(typeof formItemProps?.feedbackStyle === 'object'
              ? formItemProps.feedbackStyle
              : undefined),
          }
        : formItemProps?.feedbackStyle

      return (
        <NFormItemGi
          label=" "
          show-label={mergedOption.value.props?.labelPlacement === 'left'}
          {...formItemProps}
          {...getGridItemProps(mergedOption.value, formItemProps)}
          feedbackStyle={feedbackStyle}
          feedback={footerFeedback.value}
          validationStatus={footerValidationStatus.value}
        >
          <div class={`${bemClass.value}__footer`} style={defaultStyle}>
            {isFunction(prefixRender) ? prefixRender(data.value) : undefined}
            {submitBtn ? (
              <NpButton
                type="primary"
                click={submit}
                loadingDelay={250}
                props={submitBtn.props}
              >
                {submitBtn.text || footerText.submitBtnText}
              </NpButton>
            ) : undefined}
            {resetBtn ? (
              <NpButton props={resetBtn.props} click={reset}>
                {resetBtn.text || footerText.resetBtnText}
              </NpButton>
            ) : undefined}
            {isFunction(suffixRender) ? suffixRender(data.value) : undefined}
          </div>
        </NFormItemGi>
      )
    }

    /** 渲染表单项列表 */
    const renderColumns = () =>
      (mergedOption.value.columns || []).map((column, columnIdx) => {
        const gridItemProps = getGridItemProps(
          mergedOption.value,
          column.formItemProps
        )
        if (typeof column.render === 'function') {
          // n-grid 仅渲染栅格子项，自定义渲染内容需包裹 n-gi
          return <NGi {...gridItemProps}>{column.render(data.value)}</NGi>
        }
        return (
          <NpFormItem
            column={column}
            isLastColumn={columnIdx === lastItemIdx.value}
            injectKey={injectKey}
            {...gridItemProps}
          ></NpFormItem>
        )
      })

    return () => (
      <NSpin
        class="np-form__loading"
        show={loading.value}
        delay={250}
        stroke-width={0}
      >
        <NForm
          ref={formExpose}
          model={data.value}
          class={bemClass.value}
          {...mergedOption.value.props}
          onSubmit={(e: Event) => {
            e?.preventDefault()
            submit()
          }}
        >
          <NGrid {...gridConfig.value}>
            {renderColumns()}
            {footer()}
          </NGrid>
        </NForm>
      </NSpin>
    )
  },
})
