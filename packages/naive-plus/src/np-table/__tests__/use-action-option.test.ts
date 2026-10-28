import { NText } from 'naive-ui'
import { describe, expect, test } from 'vitest'
import {
  buildOperationOptions,
  createOperationDefaults,
  mergeOperationDefaults,
} from '../src/use-action-option'

describe('buildOperationOptions', () => {
  test('returns default edit and delete options when no config is provided', () => {
    const options = buildOperationOptions()

    expect(options).toHaveLength(2)
    expect(options[0]).toMatchObject({ key: 'edit', label: '编辑' })
    expect(options[1]?.key).toBe('delete')
    expect(typeof options[1]?.label).toBe('function')
  })

  test('builds default options from EDIT and DEL types', () => {
    const options = buildOperationOptions([{ type: 'edit' }, { type: 'del' }])
    const deleteLabel = options[1]?.label as () => ReturnType<typeof NText>
    const vnode = deleteLabel()

    expect(options[0]).toMatchObject({ key: 'edit', label: '编辑' })
    expect(options[1]?.key).toBe('delete')
    expect(vnode.type).toBe(NText)
    expect(vnode.props?.type).toBe('error')
  })

  test('allows custom fields to extend the default EDIT and DEL options', () => {
    const options = buildOperationOptions([
      { type: 'edit', disabled: true },
      { type: 'del', props: { style: { width: '120px' } } },
    ])

    expect(options[0]).toMatchObject({
      key: 'edit',
      label: '编辑',
      disabled: true,
    })
    expect(options[1]).toMatchObject({
      key: 'delete',
      props: { style: { width: '120px' } },
    })
  })

  test('preserves custom options without special types', () => {
    const options = buildOperationOptions([{ key: 'view', label: '查看' }])

    expect(options).toEqual([{ key: 'view', label: '查看' }])
  })

  test('resolves options from a function with row data and index', () => {
    const options = buildOperationOptions(
      (rowData, rowIndex) => [
        { key: `view-${rowData.id}`, label: `查看${rowIndex}` },
      ],
      { id: 1 },
      2
    )

    expect(options).toEqual([{ key: 'view-1', label: '查看2' }])
  })

  test('supports built-in types returned by a function', () => {
    const options = buildOperationOptions(
      rowData => [{ type: 'del', disabled: rowData.locked }],
      { locked: true }
    )

    expect(options).toHaveLength(1)
    expect(options[0]).toMatchObject({ key: 'delete', disabled: true })
  })

  test('replaces the built-in options with defaultOptions', () => {
    const options = buildOperationOptions(undefined, {}, 0, {
      edit: { label: 'Edit', key: 'edit' },
      del: { label: 'Delete', key: 'delete' },
    })

    expect(options).toHaveLength(2)
    expect(options[0]).toMatchObject({ key: 'edit', label: 'Edit' })
    expect(options[1]).toMatchObject({ key: 'delete', label: 'Delete' })
  })

  test('option fields take priority over defaultOptions', () => {
    const options = buildOperationOptions(
      [{ type: 'edit', label: '修改' }],
      {},
      0,
      {
        edit: { label: 'Edit', key: 'edit' },
      }
    )

    expect(options[0]).toMatchObject({ key: 'edit', label: '修改' })
  })

  test('keeps the built-in key when defaultOptions only overrides part of fields', () => {
    const options = buildOperationOptions(undefined, {}, 0, {
      edit: { label: '修改' },
    })

    expect(options[0]).toMatchObject({ key: 'edit', label: '修改' })
    expect(options[1]?.key).toBe('delete')
  })

  test('createOperationDefaults keeps the error style of the delete item', () => {
    const defaults = createOperationDefaults({
      editLabel: 'Edit',
      delLabel: 'Delete',
    })

    expect(defaults.edit).toMatchObject({ key: 'edit', label: 'Edit' })

    const deleteLabel = defaults.del?.label as () => ReturnType<typeof NText>
    const vnode = deleteLabel()
    expect(vnode.type).toBe(NText)
    expect(vnode.props?.type).toBe('error')
  })

  test('mergeOperationDefaults merges each item by priority', () => {
    const merged = mergeOperationDefaults(
      createOperationDefaults({ editLabel: '编辑', delLabel: '删除' }),
      { edit: { label: '修改' } },
      { edit: { disabled: true }, del: { disabled: false } }
    )

    expect(merged.edit).toMatchObject({
      key: 'edit',
      label: '修改',
      disabled: true,
    })
    expect(merged.del).toMatchObject({ key: 'delete', disabled: false })
  })

  test('mergeOperationDefaults skips empty sources', () => {
    expect(mergeOperationDefaults(undefined, {})).toEqual({})
  })
})
