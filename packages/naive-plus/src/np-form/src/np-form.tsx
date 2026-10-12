import {
  computed,
  defineComponent,
  getCurrentInstance,
  provide,
  ref,
  watch,
  type StyleValue,
} from 'vue'
import { useCreate } from '../../_hooks/create'
import { npFormProps } from './props'
import { NForm, NFormItem, NSpin, type FormInst } from 'naive-ui'
import NpFormItem from './np-form-item'
import type { FormInjection } from './interface'
import { cloneDeep, isEqual, throttle } from 'lodash-es'
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

export default defineComponent({
  name,
  inheritAttrs: false,
  props: npFormProps,
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const injectKey = Symbol('np-form-inject-key')
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
        props.option.footer !== false &&
        props.option.footer?.submitErrorFeedback !== false
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
      props.option.columns?.forEach(column => {
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
      props,
      injectKey,
      event,
      submit,
    })

    /**
     * 最后一个实际渲染的表单项索引（跳过 render 列与 display 为 false 的列）
     * 用于 enterSubmitMode === 'last' 时判断回车是否提交
     */
    const lastItemIdx = computed(() => {
      const columns = props.option.columns || []
      for (let i = columns.length - 1; i >= 0; i--) {
        const column = columns[i]
        if (typeof column.render !== 'function' && column.display !== false) {
          return i
        }
      }
      return -1
    })

    const footer = () => {
      if (props.option.footer === false) {
        return undefined
      }

      const {
        prefixRender,
        suffixRender,
        submitBtn = {},
        resetBtn = {},
        style = {},
      } = props.option.footer || {}

      const defaultStyle: StyleValue = {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '16px',
        ...style,
      }

      return (
        <NFormItem
          label=" "
          show-label={props.option.props?.labelPlacement === 'left'}
          {...props.option.footer?.formItemProps}
          feedback={footerFeedback.value}
          validationStatus={footerValidationStatus.value}
        >
          <div style={defaultStyle}>
            {isFunction(prefixRender) ? prefixRender(data.value) : undefined}
            {submitBtn ? (
              <NpButton
                type="primary"
                click={submit}
                loadingDelay={250}
                props={submitBtn.props}
              >
                {submitBtn.text || '提交'}
              </NpButton>
            ) : undefined}
            {resetBtn ? (
              <NpButton props={resetBtn.props} click={reset}>
                {resetBtn.text || '重置'}
              </NpButton>
            ) : undefined}
            {isFunction(suffixRender) ? suffixRender(data.value) : undefined}
          </div>
        </NFormItem>
      )
    }

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
          {...props.option.props}
          onSubmit={(e: Event) => {
            e?.preventDefault()
            submit()
          }}
        >
          {(props.option.columns || []).map((column, columnIdx) => {
            if (typeof column.render === 'function') {
              return column.render(data.value)
            }
            return (
              <NpFormItem
                column={column}
                isLastColumn={columnIdx === lastItemIdx.value}
                injectKey={injectKey}
              ></NpFormItem>
            )
          })}
          {footer()}
        </NForm>
      </NSpin>
    )
  },
})
