import { ref, type Ref } from 'vue'
import { omit } from 'lodash-es'
import type { TableColumn, TableOption } from './interface'
import type { FormColumn } from '../../np-form'
import type { AnyObject } from '../../types'

export type CrudMode = 'add' | 'edit' | 'del'
type FormMode = Exclude<CrudMode, 'del'>

const MODE_PROPS_KEY = {
  add: 'addProps',
  edit: 'editProps',
} as const satisfies Record<FormMode, string>

/** 属于列自身的字段（内容 / 数据源 / 数据契约 / 状态 / 事件），不允许被全局默认配置覆盖 */
const COLUMN_OWN_KEYS = [
  'key',
  'label',
  'render',
  'slots',
  'options',
  'rule',
  'urlOnly',
  'defaultValue',
  'onChange',
]

/** 移除全局列表单配置中的列自身字段 */
const omitColumnOwnKeys = (props: Partial<FormColumn>): Partial<FormColumn> =>
  omit(props, COLUMN_OWN_KEYS)

/**
 * 清洗全局列表单配置：
 * 去掉内容 / 数据源 / 数据契约 / 状态 / 事件字段（含 `addProps` / `editProps` 中的），
 * 避免全局配置覆盖每一列自身的内容与行为
 */
const sanitizeColumnFormProps = (
  props?: TableColumn['formProps']
): TableColumn['formProps'] | undefined => {
  if (!props) return undefined
  const { addProps, editProps, ...base } = props
  return {
    ...omitColumnOwnKeys(base),
    ...(addProps && { addProps: omitColumnOwnKeys(addProps) }),
    ...(editProps && { editProps: omitColumnOwnKeys(editProps) }),
  }
}

/** 需要一层合并（而非整体覆盖）的字段 */
const MERGE_KEYS = ['props', 'formItemProps'] as const
/** 按操作模式覆盖的字段，其内部同样需要一层合并 */
const MODE_KEYS = ['addProps', 'editProps'] as const

/**
 * 合并全局与列自身的列表单配置，列自身优先级更高；
 * `props` / `formItemProps`（含 `addProps` / `editProps` 中的）做一层合并，
 * 避免列自身只写部分属性时丢掉全局默认值
 */
const mergeColumnFormProps = (
  base?: TableColumn['formProps'],
  override?: TableColumn['formProps']
): TableColumn['formProps'] => {
  const merged = { ...base, ...override } as AnyObject
  MERGE_KEYS.forEach(key => {
    if (base?.[key] || override?.[key]) {
      merged[key] = { ...base?.[key], ...override?.[key] }
    }
  })
  MODE_KEYS.forEach(key => {
    if (base?.[key] || override?.[key]) {
      merged[key] = mergeColumnFormProps(base?.[key], override?.[key])
    }
  })
  return merged as TableColumn['formProps']
}

export const buildFormColumns = (
  columns: TableColumn[],
  mode: FormMode,
  columnFormProps?: TableColumn['formProps']
): FormColumn[] => {
  // 全局默认配置优先级最低，且不覆盖列自身的内容字段
  const globalFormProps = sanitizeColumnFormProps(columnFormProps)

  return columns
    .map(col => {
      const { key, label } = col
      if (!col.formProps && !key) return null

      const formProps = mergeColumnFormProps(globalFormProps, col.formProps)
      const modeKey = MODE_PROPS_KEY[mode] as keyof typeof formProps
      const { [modeKey]: modeProps = {}, ...baseFormProps } = formProps

      // 模式专属配置与基础配置同样逐层合并，避免只写部分属性时丢掉基础配置
      const merged: FormColumn = {
        key,
        label,
        ...mergeColumnFormProps(baseFormProps, modeProps),
      } as FormColumn

      if (merged.display === undefined) {
        merged.display = true
      }
      return merged
    })
    .filter((col): col is FormColumn => col !== null && col.display !== false)
}

const buildAddInitData = (formColumns: FormColumn[]): AnyObject =>
  Object.fromEntries(
    formColumns
      .filter(col => col.key && (col as any).defaultValue !== undefined)
      .map(col => [col.key, (col as any).defaultValue])
  )

export const useCrud = (
  getOption: () => TableOption,
  onRefresh: () => void,
  /** 读取 np-config-provider 中所有列的默认表单属性 */
  getColumnFormProps?: () => TableColumn['formProps']
) => {
  const dialogVisible = ref(false)
  const delVisible = ref(false)
  const crudMode = ref<FormMode>('add')
  const formData = ref<AnyObject>({})
  const dialogLoading = ref(false)
  const delLoading = ref(false)
  const delRow = ref<AnyObject>({})

  const openAction = async (
    type: 'add' | 'edit' | 'del',
    rowData?: AnyObject
  ): Promise<AnyObject | null> => {
    const option = getOption()
    const operation = option.operation
    if (operation === false) return null

    let data: AnyObject = rowData ?? {}

    if (operation?.onBefore) {
      try {
        const result = await operation.onBefore(data, type)
        if (result === false) return null
        // 替换初始数据：对象（排除 boolean/true）即为新数据
        if (result && typeof result === 'object') {
          data = result
        }
      } catch {
        return null
      }
    }

    if (type === 'del') {
      delRow.value = data
      delVisible.value = true
      return data
    }

    crudMode.value = type
    formData.value =
      type === 'add'
        ? buildAddInitData(
            buildFormColumns(option.columns, 'add', getColumnFormProps?.())
          )
        : { ...data }
    dialogVisible.value = true
    return data
  }

  const runApiAction = async (
    fn: ((rowData: AnyObject) => unknown) | undefined,
    submitData: AnyObject,
    loadingRef: Ref<boolean>,
    closeRef: Ref<boolean>
  ): Promise<void> => {
    if (!fn) {
      // api 未配置时直接关闭弹窗，不触发刷新，避免给用户"已保存"的错觉
      closeRef.value = false
      return
    }
    loadingRef.value = true
    try {
      const result = await fn(submitData)
      if (result === false) return // 阻断：保持打开
      closeRef.value = false
      onRefresh()
    } catch {
      // 异常：保持打开
    } finally {
      loadingRef.value = false
    }
  }

  const handleSubmit = (submitData: AnyObject) =>
    runApiAction(
      crudMode.value === 'add' ? getOption().api.add : getOption().api.edit,
      submitData,
      dialogLoading,
      dialogVisible
    )

  const handleDel = (row: AnyObject) =>
    runApiAction(getOption().api.del, row, delLoading, delVisible)

  return {
    dialogVisible,
    delVisible,
    crudMode,
    formData,
    dialogLoading,
    delLoading,
    delRow,
    openAction,
    handleSubmit,
    handleDel,
  }
}
