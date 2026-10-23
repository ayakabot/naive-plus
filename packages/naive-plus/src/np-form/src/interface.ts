import type { AnyObject, Run } from '../../types'
import type { CSSProperties, Ref, VNode } from 'vue'
import type {
  AutoCompleteGroupOption,
  AutoCompleteOption,
  AutoCompleteProps,
  AutoCompleteSlots,
  ButtonProps,
  CascaderOption,
  CascaderProps,
  CascaderSlots,
  DatePickerProps,
  DatePickerSlots,
  DynamicTagsProps,
  DynamicTagsSlots,
  FormItemGiProps,
  FormItemRule,
  FormProps,
  GridProps,
  InputNumberProps,
  InputNumberSlots,
  InputProps,
  InputSlots,
  RateProps,
  SelectOption,
  SelectProps,
  SelectSlots,
  SliderProps,
  SliderSlots,
  SwitchProps,
  SwitchSlots,
  TimePickerProps,
  TimePickerSlots,
  TransferOption,
  TransferProps,
  TreeSelectOption,
  TreeSelectProps,
  TreeSelectSlots,
  UploadProps,
  FormInst as NFormInst,
} from 'naive-ui'
import type { NpRadioProps, RadioOption, RadioValue } from '../../np-radio'
import type {
  CheckboxGroupValue,
  CheckboxOption,
  NpCheckboxProps,
} from '../../np-checkbox'
import type EventBus from '../../utils/event-bus'

export type Rule = Omit<FormItemRule, 'validator' | 'asyncValidator'> & {
  validator?: (
    value: any,
    rule: Omit<Rule, 'validator'> & { field: string },
    callback: (error?: string | Error) => void
  ) => boolean | Error | Error[] | Promise<void> | undefined
}

export interface FormColumnBase<FormData extends AnyObject = AnyObject> {
  /**
   * 标签值
   */
  label?: Run<FormData, string> | ((data: FormData) => VNode)
  /**
   * 属性值
   */
  key?: string
  /**
   * 完全自定义渲染
   * @param data 当前表单数据
   * @returns 视图
   */
  render?: (data: FormData) => VNode
  /**
   * 表单字段校验规则。TS 类型：Array<Rule>
   */
  rule?: Run<FormData, Rule | Array<Rule>> | Rule | Array<Rule>
  /**
   * 表单项属性，可通过 `span` / `offset` 控制栅格布局
   */
  formItemProps?: FormGridItemProps
  /**
   * 是否显示
   * @defaultValue true
   */
  display?: Run<FormData, boolean>
}

/**
 * 表单项属性
 * - 兼容 `n-form-item` 属性，额外支持 `span` / `offset`
 * - 响应式写法为 `'默认值 断点:值 ...'`，默认值不要写 `0`，否则 `n-grid` 会跳过该表单项
 * - `offset` 需与 `span` 搭配使用：未指定 `span` 时默认占满整行，此时再设置 `offset` 会导致整行右移溢出容器
 * @example
 * ```ts
 * // 支持数字
 * { span: 24 }
 * // 支持 px 响应式
 * { span: "24 400:12 600:8 800:6" }
 * // 支持命名断点响应式，需配合 option.grid.responsive: 'screen'
 * { span: "24 s:12 m:8" }
 * ```
 */
export type FormGridItemProps = Omit<
  FormItemGiProps,
  | 'label'
  | 'rule'
  | 'path'
  | 'rulePath'
  | 'privateSpan'
  | 'privateOffset'
  | 'privateColStart'
  | 'privateShow'
>

type OmitValue =
  | 'defaultValue'
  | 'modelValue'
  | 'value'
  | 'onUpdate:value'
  | 'onUpdateValue'
type OnChangeCtx<FormData extends AnyObject> = {
  data: FormData
  setData: (newData: FormData) => void
}
export type FormColumnComponent<FormData extends AnyObject = AnyObject> =
  | {
      type?: 'input' | 'text'
      props?: Omit<InputProps, OmitValue | 'type'>
      slots?: InputSlots
      defaultValue?: string
      onChange?: (value: string, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'textarea'
      props?: Omit<InputProps, OmitValue | 'type'>
      slots?: InputSlots
      defaultValue?: string
      onChange?: (value: string, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'password'
      props?: Omit<InputProps, OmitValue | 'type'>
      slots?: InputSlots
      defaultValue?: string
      onChange?: (value: string, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'number'
      props?: Omit<InputNumberProps, OmitValue>
      slots?: InputNumberSlots
      defaultValue?: number
      onChange?: (value: number, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'radio'
      props?: Omit<NpRadioProps, OmitValue>
      defaultValue?: RadioValue
      options: Run<FormData, Array<RadioOption | any>>
      onChange?: (value: RadioValue, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'checkbox'
      props?: Omit<NpCheckboxProps, OmitValue>
      defaultValue?: CheckboxGroupValue
      options: Run<FormData, Array<CheckboxOption | any>>
      onChange?: (value: CheckboxGroupValue, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'autoComplete'
      props?: Omit<AutoCompleteProps, OmitValue>
      slots?: AutoCompleteSlots
      defaultValue?: string
      options: Run<
        FormData,
        Array<AutoCompleteOption | AutoCompleteGroupOption | string>
      >
      onChange?: (value: string, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'cascader'
      props?: Omit<CascaderProps, OmitValue>
      slots?: CascaderSlots
      defaultValue?: string | number | Array<string> | Array<number>
      options: Run<FormData, Array<CascaderOption>>
      onChange?: (
        value: string | number | Array<string> | Array<number>,
        ctx: OnChangeCtx<FormData>
      ) => void
    }
  | {
      type: 'tag'
      props?: Omit<DynamicTagsProps, OmitValue>
      slots?: DynamicTagsSlots
      defaultValue?: string[]
      onChange?: (value: string[], ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'date'
      props?: Omit<DatePickerProps, OmitValue>
      slots?: DatePickerSlots
      defaultValue?: string | [string, string]
      onChange?: (
        value: string | [string, string],
        ctx: OnChangeCtx<FormData>
      ) => void
    }
  | {
      type: 'rate'
      props?: Omit<RateProps, OmitValue>
      defaultValue?: number
      onChange?: (value: number, ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'select'
      props?: Omit<SelectProps, OmitValue>
      slots?: SelectSlots
      defaultValue?: Array<string | number> | string | number
      options: Run<FormData, Array<SelectOption | any>>
      onChange?: (
        value: Array<string | number> | string | number,
        ctx: OnChangeCtx<FormData> & {
          option: SelectOption | SelectOption[]
        }
      ) => void
    }
  | {
      type: 'slider'
      props?: Omit<SliderProps, OmitValue>
      slots?: SliderSlots
      defaultValue?: number | number[]
      onChange?: (value: number | number[], ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: 'switch'
      props?: Omit<SwitchProps, OmitValue>
      slots?: SwitchSlots
      defaultValue?: string | number | boolean
      onChange?: (
        value: string | number | boolean,
        ctx: OnChangeCtx<FormData>
      ) => void
    }
  | {
      type: 'time'
      props?: Omit<TimePickerProps, OmitValue>
      slots?: TimePickerSlots
      defaultValue?: string
      onChange?: (value: string, ctx: OnChangeCtx<FormData>) => void
    }
  // | {
  //     type: 'selectInput'
  //     props?: Omit<TdSelectInputProps, OmitValue>
  //     /**
  //      * 默认值
  //      */
  //     defaultValue?: SelectInputValue
  //   }
  | {
      type: 'transfer'
      props?: Omit<TransferProps, OmitValue>
      defaultValue?: Array<string | number>
      options: Run<FormData, Array<TransferOption | string | number>>
      onChange?: (
        value: Array<string | number>,
        ctx: OnChangeCtx<FormData>
      ) => void
    }
  | {
      type: 'tree'
      props?: Omit<TreeSelectProps, OmitValue>
      slots?: TreeSelectSlots
      defaultValue?: string | number | Array<string | number>
      options: Run<FormData, Array<TreeSelectOption>>
      onChange?: (
        value: string | number | Array<string | number>,
        ctx: OnChangeCtx<FormData> & {
          option: TreeSelectOption &
            null &
            TreeSelectOption[] &
            Array<TreeSelectOption | null>
          meta:
            | {
                node: TreeSelectOption
                action: 'select' | 'unselect'
              }
            | {
                node: TreeSelectOption | null
                action: 'delete'
              }
            | {
                node: null
                action: 'clear'
              }
        }
      ) => void
    }
  | {
      type: 'upload'
      props?: Omit<
        UploadProps,
        | 'fileList'
        | 'defaultFileList'
        | 'onUpdate:fileList'
        | 'onUpdateFileList'
      >
      slots?: {
        default?: () => VNode
      }
      urlOnly?: boolean
      defaultValue?: string[]
      onChange?: (value: string[], ctx: OnChangeCtx<FormData>) => void
    }
  | {
      type: (form: FormData) => VNode
      props?: any
      defaultValue?: any
      onChange?: (value: any, ctx: OnChangeCtx<FormData>) => void
    }

export type FormColumn<FormData extends AnyObject = AnyObject> =
  FormColumnBase<FormData> & FormColumnComponent<FormData>

export interface FormOption<FormData extends AnyObject = AnyObject> {
  onSubmit?: Run<FormData, void>
  onReset?: Run<FormData, void>
  /**
   * 回车提交表单
   * - `'last'`: 仅在最后一个表单项回车时提交
   * - `'all'`: 任意表单项回车都提交
   * - `false`: 禁用回车提交
   * @defaultValue false
   */
  enterSubmitMode?: 'last' | 'all' | false
  /**
   * 栅格布局配置，直接透传给 `n-grid`
   * - 表单项始终使用 `n-form-item-gi` 渲染，未指定 `span` 时占满整行
   * - `itemResponsive` 默认开启；传 `false` 仅在 `cols` / `xGap` / `yGap` 均为固定数值时才会真正关闭
   * @example
   * ```ts
   * grid: {
   *   cols: 24,           // 默认24，支持响应式如 cols="2 400:4 600:6"
   *   responsive: 'self', // 默认基于自身宽度进行响应式布局，可选 screen
   *   itemResponsive: true, // 默认开启，支持响应式 span / offset
   *   xGap: 0,            // 横向间隔槽
   *   yGap: 0             // 纵向间隔槽
   * }
   * ```
   */
  grid?: Partial<GridProps>
  columns: FormColumn<FormData>[]
  props?: Omit<FormProps, 'model' | 'rules' | 'onSubmit'>
  footer?:
    | false
    | {
        formItemProps?: FormGridItemProps
        style?: CSSProperties
        prefixRender?: (data: FormData) => VNode
        suffixRender?: (data: FormData) => VNode
        /**
         * 底部内容对齐方式
         * - `'left'`: 靠左对齐
         * - `'right'`: 靠右对齐，校验反馈信息同步靠右
         * @defaultValue left
         */
        align?: 'left' | 'right'
        /**
         * 提交（onSubmit）异常时，是否将错误信息展示在底部表单项的校验反馈中
         * @defaultValue true
         */
        submitErrorFeedback?: boolean
        submitBtn?:
          | false
          | {
              text?: string
              props?: Omit<ButtonProps, 'type' | 'onClick'>
            }
        resetBtn?:
          | false
          | {
              text?: string
              props?: Omit<ButtonProps, 'onClick'>
            }
      }
}

export interface FormInst extends NFormInst {
  submit: () => Promise<void>
  reset: () => Promise<void>
  validateFields: (fields: string | string[]) => Promise<void>
}

export interface FormInjection<FormData extends AnyObject = AnyObject> {
  props: {
    option: FormOption<FormData>
  }
  data: Ref<FormData>
  readonly event: EventBus<{
    'data-change': AnyObject
  }>
  readonly injectKey: symbol
  readonly submit: () => Promise<void>
}

/**
 * 表单项工具注入接口
 * @example
 * ```ts
 * const formItemTool = inject<FormItemToolInjection>('np-form-item-tool', {
 *   setFeedback: () => {},
 * })
 * formItemTool.setFeedback('错误信息', 'error')
 *
 * formItemTool.setFeedback() // 清除反馈信息
 * ```
 */
export interface FormItemToolInjection {
  /**
   * 更新反馈信息
   * @param feedback 反馈信息，当 undefined 时表示不显示反馈信息
   * @param status 反馈状态，默认值为 'error'
   * @returns void
   */
  setFeedback: (
    feedback?: string,
    status?: 'error' | 'success' | 'warning'
  ) => void
}
