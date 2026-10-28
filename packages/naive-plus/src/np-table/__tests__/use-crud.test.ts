import { describe, expect, test } from 'vitest'
import { buildFormColumns } from '../src/use-crud'
import type { TableColumn } from '../src/interface'

describe('buildFormColumns', () => {
  test('does not crash when a column has no formProps (regression)', () => {
    const columns: TableColumn[] = [{ key: 'name', label: '姓名' }]

    expect(() => buildFormColumns(columns, 'add')).not.toThrow()
    expect(() => buildFormColumns(columns, 'edit')).not.toThrow()
  })

  test('filters out columns whose formProps.display is false', () => {
    const columns: TableColumn[] = [
      { key: 'name', label: '姓名' },
      { key: 'tel', label: '电话', formProps: { display: false } },
    ]

    const result = buildFormColumns(columns, 'add')

    expect(result.map(col => col.key)).toEqual(['name'])
  })

  test('keeps function display and lets np-form resolve it dynamically', () => {
    const display = (data: Record<string, any>) => data.gender === 'man'
    const columns: TableColumn[] = [
      { key: 'age', label: '年龄', formProps: { display } },
    ]

    const result = buildFormColumns(columns, 'add')

    expect(result).toHaveLength(1)
    expect(result[0].display).toBe(display)
  })

  test('mode-specific display overrides base formProps.display', () => {
    const columns: TableColumn[] = [
      {
        key: 'age',
        label: '年龄',
        formProps: { display: true, addProps: { display: false } },
      },
    ]

    expect(buildFormColumns(columns, 'add')).toHaveLength(0)
    expect(buildFormColumns(columns, 'edit')).toHaveLength(1)
  })

  test('merges global column formProps with lower priority than column', () => {
    const columns: TableColumn[] = [
      { key: 'name', label: '姓名', formProps: { props: { size: 'large' } } },
      { key: 'tel', label: '电话' },
    ]

    const result = buildFormColumns(columns, 'add', {
      props: { size: 'small' },
    })

    expect(result[0].props).toEqual({ size: 'large' })
    expect(result[1].props).toEqual({ size: 'small' })
  })

  test('global column formProps 的 props / formItemProps 与列自身逐层合并', () => {
    const columns: TableColumn[] = [
      {
        key: 'name',
        label: '姓名',
        formProps: {
          props: { placeholder: '请输入' },
          formItemProps: { span: 12 },
        },
      },
    ]

    const result = buildFormColumns(columns, 'add', {
      props: { size: 'small' },
      formItemProps: { labelWidth: 100 },
    })

    expect(result[0].props).toEqual({ size: 'small', placeholder: '请输入' })
    expect(result[0].formItemProps).toEqual({ labelWidth: 100, span: 12 })
  })

  test('global column formProps supports mode-specific props', () => {
    const columns: TableColumn[] = [{ key: 'name', label: '姓名' }]

    const addColumns = buildFormColumns(columns, 'add', {
      props: { size: 'small' },
      addProps: { props: { size: 'medium' } },
    })
    const editColumns = buildFormColumns(columns, 'edit', {
      props: { size: 'small' },
      addProps: { props: { size: 'medium' } },
    })

    expect(addColumns[0].props).toEqual({ size: 'medium' })
    expect(editColumns[0].props).toEqual({ size: 'small' })
  })

  test('列自身的 addProps 与全局 addProps 逐层合并', () => {
    const columns: TableColumn[] = [
      {
        key: 'name',
        label: '姓名',
        formProps: { addProps: { props: { size: 'large' } } },
      },
    ]

    const result = buildFormColumns(columns, 'add', {
      addProps: {
        props: { size: 'medium', placeholder: '请输入' },
        formItemProps: { labelWidth: 100 },
      },
    })

    expect(result[0].props).toEqual({ size: 'large', placeholder: '请输入' })
    expect(result[0].formItemProps).toEqual({ labelWidth: 100 })
  })

  test('addProps 的 props / formItemProps 与基础配置逐层合并', () => {
    const columns: TableColumn[] = [
      {
        key: 'name',
        label: '姓名',
        formProps: {
          props: { placeholder: '请输入' },
          formItemProps: { span: 12 },
          addProps: { props: { size: 'large' } },
        },
      },
    ]

    const result = buildFormColumns(columns, 'add')

    expect(result[0].props).toEqual({ placeholder: '请输入', size: 'large' })
    expect(result[0].formItemProps).toEqual({ span: 12 })
  })

  test('global column formProps never overrides column key / label / render', () => {
    const render = () => null as any
    const columns: TableColumn[] = [
      { key: 'name', label: '姓名', formProps: { render } },
      { key: 'tel', label: '电话' },
    ]

    const globalFormProps = {
      label: '统一标题',
      key: 'unified',
      render,
      addProps: { label: '统一新增标题' },
      editProps: { label: '统一编辑标题' },
    } as unknown as TableColumn['formProps']

    const addColumns = buildFormColumns(columns, 'add', globalFormProps)
    const editColumns = buildFormColumns(columns, 'edit', globalFormProps)

    expect(addColumns.map(col => [col.key, col.label])).toEqual([
      ['name', '姓名'],
      ['tel', '电话'],
    ])
    expect(editColumns.map(col => [col.key, col.label])).toEqual([
      ['name', '姓名'],
      ['tel', '电话'],
    ])

    // 列自身的 render 保留，全局 render 不生效
    expect(addColumns[0].render).toBe(render)
    expect(addColumns[1].render).toBeUndefined()
    expect(editColumns[1].render).toBeUndefined()
  })

  test('global column formProps 中的列自身字段会被清洗', () => {
    const columns: TableColumn[] = [{ key: 'name', label: '姓名' }]
    const globalFormProps = {
      props: { size: 'small' },
      options: [{ label: 'A', value: 1 }],
      onChange: () => {},
      defaultValue: 'x',
      rule: [{ required: true }],
      urlOnly: true,
      slots: {},
      addProps: { options: [{ label: 'B', value: 2 }], defaultValue: 'y' },
    } as unknown as TableColumn['formProps']

    const result = buildFormColumns(columns, 'add', globalFormProps) as Array<
      Record<string, any>
    >

    // 展示类字段保留
    expect(result[0].props).toEqual({ size: 'small' })
    // 数据源 / 事件 / 状态 / 数据契约 / 内容字段被清洗
    expect(result[0].options).toBeUndefined()
    expect(result[0].onChange).toBeUndefined()
    expect(result[0].defaultValue).toBeUndefined()
    expect(result[0].rule).toBeUndefined()
    expect(result[0].urlOnly).toBeUndefined()
    expect(result[0].slots).toBeUndefined()
  })
})
