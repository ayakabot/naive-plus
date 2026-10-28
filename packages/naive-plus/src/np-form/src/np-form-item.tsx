import {
  computed,
  defineComponent,
  inject,
  onUnmounted,
  provide,
  ref,
  type VNode,
} from 'vue'
import { useCreate } from '../../_hooks/create'
import { useLocale } from '../../_hooks/config'
import { npFormItemProps } from './props'
import {
  NAutoComplete,
  NCascader,
  NDatePicker,
  NDynamicTags,
  NFormItemGi,
  NInput,
  NInputNumber,
  NRate,
  NSelect,
  NSlider,
  NSwitch,
  NTimePicker,
  NTransfer,
  NTreeSelect,
  type FormItemRule,
} from 'naive-ui'
import type {
  FormColumnComponent,
  FormInjection,
  FormItemToolInjection,
  Rule,
} from './interface'
import { getGridItemProps } from './grid'
import NpCheckbox from '../../np-checkbox'
import NpRadio from '../../np-radio'
import NpUpload from '../../np-upload'
import {
  arrayTransferByKeys,
  computedAsync,
  isArray,
  isFunction,
  isString,
  runAsync,
} from '../../utils'
import type { AnyObject } from '../../types'
import EventBus from '../../utils/event-bus'

const { name, bemClass } = useCreate('np-form-item')

const getControlledValue = <T,>(value: T | undefined, emptyValue: T) => {
  return value ?? emptyValue
}

const NpFormItem = defineComponent({
  name,
  props: npFormItemProps,
  setup(props) {
    const formInj = inject<FormInjection>(props.injectKey as any, {
      props: { option: { columns: [] } },
      data: ref({}),
      injectKey: Symbol('default-form-item-key'),
      event: new EventBus<{
        'data-change': AnyObject
      }>(),
      submit: async () => {},
    })

    const { type } = props.column || {}
    const locale = useLocale()
    const columnKey = props.column.key || '_unknown'
    /** 栅格占位，未指定 span 时占满整行 */
    const gridItemProps = computed(() =>
      getGridItemProps(formInj.props.option, props.column.formItemProps)
    )

    const value = computed({
      get: () => formInj.data.value[columnKey],
      set: val => (formInj.data.value[columnKey] = val),
    })

    const label = ref<string | VNode>('')
    const display = ref(true)
    const rule = ref<FormItemRule[]>()

    const uploadBlobRule: Rule = {
      validator: (value: any) => {
        if (!isArray(value)) return true
        const hasBlobUrl = value.some((item: string) => {
          try {
            const parsed = JSON.parse(item)
            return parsed.url && String(parsed.url).startsWith('blob:')
          } catch {
            return String(item).startsWith('blob:')
          }
        })
        if (hasBlobUrl) {
          return new Error(locale.value.Form.uploadPendingTip)
        }
        return true
      },
    }

    const initRule = (newRule: Rule[]) => {
      let res: Rule[] = []
      // 数字类型默认加上 type: 'number' 的校验
      if (type === 'number' || type === 'rate' || type === 'slider') {
        res = newRule.map(item => {
          if (item.type === undefined) {
            return { ...item, type: 'number' }
          }
          return item
        })
      } else {
        res = [...newRule]
      }
      // upload 类型默认加上 blob URL 校验
      if (type === 'upload') {
        res.push(uploadBlobRule)
      }
      rule.value = res.map(item => {
        const ruleKey = `${columnKey}${item.key ? `__${item.key}` : ''}`
        if (item.validator !== undefined) {
          return {
            ...item,
            key: ruleKey,
            validator: (rule, value, callback) => {
              return item.validator?.(value, rule as any, callback)
            },
          }
        }
        return {
          ...item,
          key: ruleKey,
        }
      })
    }

    let initVersion = 0
    const init = async (newData: AnyObject) => {
      const version = ++initVersion
      runAsync(props.column?.label, newData).then(res => {
        if (version !== initVersion) return
        label.value = res
      })
      if (props.column?.display !== undefined) {
        runAsync(props.column?.display, newData).then(res => {
          if (version !== initVersion) return
          display.value = res !== false
        })
      }
      if (props.column?.rule !== undefined) {
        runAsync<Rule[] | Rule>(props.column?.rule, newData).then(res => {
          if (version !== initVersion) return
          const newRule = isArray(res) ? res : [res]
          initRule(newRule)
        })
      } else if (type === 'upload') {
        initRule([])
      }
    }
    init(formInj.data.value)
    const dataChange = (newData: AnyObject) => {
      init(newData)
    }
    formInj.event.on('data-change', dataChange)
    onUnmounted(() => {
      formInj.event.off('data-change', dataChange)
    })

    const options = computedAsync<any[]>(
      async () => {
        const { options, labelField, valueField, keyField } = (props.column ||
          {}) as any
        const res = await runAsync(options, formInj.data.value)
        return arrayTransferByKeys(res || [], {
          label: labelField,
          value: type === 'tree' ? keyField : valueField,
        })
      },
      [],
      {
        resetInitialStateEffect: type !== 'autoComplete',
      }
    )

    const onChange = (val: any, ...args: any[]) => {
      value.value = val
      const extraCtx: AnyObject = {}
      if (type === 'select') {
        extraCtx.option = args[0]
      } else if (type === 'tree') {
        extraCtx.option = args[0]
        extraCtx.meta = args[1]
      }
      // @ts-ignore
      props.column.onChange?.(val, {
        ...extraCtx,
        data: formInj.data.value,
        setData: (newData: AnyObject) => {
          formInj.data.value = { ...formInj.data.value, ...newData }
        },
      } as any)
    }

    const onBlur = (
      val: any,
      trim: 'trim' | 'trimStart' | 'trimEnd' = 'trim'
    ) => {
      value.value = isString(val) ? val[trim]() : val
    }

    const handleKeyupEnter = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') {
        return
      }
      const enterSubmitMode = formInj.props.option.enterSubmitMode
      if (!enterSubmitMode) {
        return
      }
      if (enterSubmitMode === 'all' || props.isLastColumn) {
        formInj.submit()
      }
    }

    const isFormColumnComponent = (obj: any): obj is FormColumnComponent => {
      return !isFunction(obj.render)
    }

    const comp = () => {
      const column = props.column || {}
      if (!isFormColumnComponent(column)) {
        return <span>RenderFunctionFirst</span>
      }
      const { type } = column
      if (type === undefined || type === 'input' || type === 'text') {
        return (
          <NInput
            clearable
            {...props.column.props}
            value={getControlledValue(value.value, '')}
            onUpdateValue={onChange}
            onBlur={() => onBlur(value.value)}
            onKeyup={handleKeyupEnter}
          >
            {{ ...column.slots }}
          </NInput>
        )
      }
      if (type === 'textarea') {
        return (
          <NInput
            type="textarea"
            {...props.column.props}
            value={getControlledValue(value.value, '')}
            onUpdateValue={onChange}
            onBlur={() => onBlur(value.value, 'trimEnd')}
          >
            {{ ...column.slots }}
          </NInput>
        )
      }
      if (type === 'password') {
        return (
          <NInput
            type="password"
            {...props.column.props}
            value={getControlledValue(value.value, '')}
            onUpdateValue={onChange}
            onBlur={() => onBlur(value.value)}
            onKeyup={handleKeyupEnter}
          >
            {{ ...column.slots }}
          </NInput>
        )
      }

      if (type === 'number') {
        return (
          <NInputNumber
            style="width:100%"
            showButton={false}
            {...props.column.props}
            value={getControlledValue(value.value, null)}
            onUpdateValue={onChange}
            onKeyup={handleKeyupEnter}
          >
            {{ ...column.slots }}
          </NInputNumber>
        )
      }

      if (type === 'autoComplete') {
        return (
          <NAutoComplete
            clearable
            {...props.column.props}
            options={options.value}
            value={getControlledValue(value.value, '')}
            onBlur={() => onBlur(value.value)}
            onUpdateValue={onChange}
            onKeyup={handleKeyupEnter}
          >
            {{ ...column.slots }}
          </NAutoComplete>
        )
      }

      if (type === 'cascader') {
        return (
          <NCascader
            clearable
            {...props.column.props}
            value={value.value}
            onUpdateValue={onChange}
            options={options.value}
          >
            {{ ...column.slots }}
          </NCascader>
        )
      }

      if (type === 'checkbox') {
        return (
          <NpCheckbox
            props={props.column.props}
            loadingDelay={props.column.props?.loadingDelay}
            options={options.value}
            modelValue={value.value}
            onChange={onChange}
          ></NpCheckbox>
        )
      }

      if (type === 'date') {
        return (
          <NDatePicker
            clearable
            style="width:100%"
            {...props.column.props}
            formattedValue={value.value}
            onUpdateFormattedValue={onChange}
          >
            {{ ...column.slots }}
          </NDatePicker>
        )
      }

      if (type === 'time') {
        return (
          <NTimePicker
            clearable
            style="width:100%"
            {...props.column.props}
            formattedValue={value.value}
            onUpdateFormattedValue={onChange}
          >
            {{ ...column.slots }}
          </NTimePicker>
        )
      }

      if (type === 'radio') {
        return (
          <NpRadio
            props={props.column.props}
            loadingDelay={props.column.props?.loadingDelay}
            options={options.value}
            modelValue={value.value}
            onChange={onChange}
          ></NpRadio>
        )
      }
      if (type === 'rate') {
        return (
          <NRate
            {...props.column.props}
            value={value.value}
            onUpdateValue={onChange}
          ></NRate>
        )
      }

      if (type === 'select') {
        return (
          <NSelect
            clearable
            {...props.column.props}
            options={options.value}
            value={value.value}
            onUpdateValue={onChange}
          >
            {{ ...column.slots }}
          </NSelect>
        )
      }

      if (type === 'slider') {
        return (
          <NSlider
            {...props.column.props}
            value={value.value}
            onUpdateValue={onChange}
          >
            {{ ...column.slots }}
          </NSlider>
        )
      }

      if (type === 'switch') {
        return (
          <NSwitch
            {...props.column.props}
            value={value.value}
            onUpdateValue={onChange}
          >
            {{ ...column.slots }}
          </NSwitch>
        )
      }

      if (type === 'tag') {
        return (
          <NDynamicTags
            {...props.column.props}
            value={value.value || []}
            onUpdateValue={onChange}
          >
            {{ ...column.slots }}
          </NDynamicTags>
        )
      }

      if (type === 'transfer') {
        return (
          <NTransfer
            {...props.column.props}
            value={value.value || []}
            onUpdateValue={onChange}
            options={options.value}
          ></NTransfer>
        )
      }

      if (type === 'tree') {
        return (
          <NTreeSelect
            clearable
            keyField="value"
            {...props.column.props}
            value={value.value}
            onUpdateValue={onChange}
            options={options.value}
          >
            {{ ...column.slots }}
          </NTreeSelect>
        )
      }

      if (type === 'upload') {
        return (
          <NpUpload
            props={props.column.props}
            urlOnly={(props.column as any).urlOnly}
            modelValue={value.value || []}
            onChange={onChange}
          >
            {{ ...column.slots }}
          </NpUpload>
        )
      }

      if (isFunction(type)) {
        return type(formInj.data.value)
      }

      return <span>NotSupportType</span>
    }

    const feedbackMsg = ref()
    const validationStatus = ref<'error' | 'success' | 'warning'>()
    provide<FormItemToolInjection>('np-form-item-tool', {
      setFeedback: (
        feedback?: string,
        status: 'error' | 'success' | 'warning' = 'error'
      ) => {
        feedbackMsg.value = feedback
        validationStatus.value = status || (feedback ? 'error' : undefined)
      },
    })

    return () => {
      if (!display.value) {
        return undefined
      }
      // n-form-item-gi 仅按白名单向 n-grid-item 转发 props，class 会作为
      // fallthrough attrs 落到栅格单元 div 上（而非内部的 .n-form-item）
      return (
        <NFormItemGi
          class={bemClass.value}
          {...props.column.formItemProps}
          {...gridItemProps.value}
          path={props.column.key}
          rule={rule.value}
          first={props.column.formItemProps?.first ?? true}
          feedback={feedbackMsg.value}
          validationStatus={validationStatus.value}
        >
          {{
            default: () => comp(),
            label: () => label.value,
          }}
        </NFormItemGi>
      )
    }
  },
})

// 标记为 naive-ui 栅格项，使 n-grid 能识别该组件为栅格子项（naive-ui 内部约定）
;(NpFormItem as any).__GRID_ITEM__ = true

export default NpFormItem
