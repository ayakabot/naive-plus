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
})
