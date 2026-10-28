---
permalink: /table/operation/
---

# 自定义操作列

通过 `operation` 配置项灵活控制操作列的显示与行为。

## 隐藏操作列

将 `operation` 设为 `false`，同时隐藏操作列和顶部「添加」按钮。

<demo src="../__demos__/operation-hide.vue"></demo>

## 前后插槽

通过 `prefixRender` 和 `suffixRender` 在默认操作按钮的前后插入自定义内容。

<demo src="../__demos__/operation-render.vue"></demo>

## 自定义选项与 onSelect

通过 `options` 配置下拉菜单选项，使用 `onSelect` 处理自定义项的点击事件。

- `{ type: 'edit' }` / `{ type: 'del' }` 会复用内置的编辑/删除逻辑（触发 `onBefore`、弹窗等）
- 自定义 `key` 的选项点击后触发 `onSelect` 回调

<demo src="../__demos__/operation-custom.vue"></demo>

## 动态选项

`options` 支持传入函数，可根据当前行数据动态生成下拉选项。

<demo src="../__demos__/operation-options-function.vue"></demo>

## 默认操作项配置

`options` 中只写 `{ type: 'edit' }` / `{ type: 'del' }` 时会复用内置操作项。通过 `defaultOptions` 可以覆盖内置的文案与属性（按 `edit` / `del` 逐项合并，只写 `label` 时仍保留内置的 `key`），`options` 中的同名属性优先级更高。

```ts
const option: TableOption = {
  // ...
  operation: {
    defaultOptions: {
      edit: { label: 'Edit', key: 'edit' },
      del: { label: 'Delete', key: 'delete' },
    },
  },
}
```

> 不传 `defaultOptions` 时，文案来自 `NpConfigProvider` 的 [locale](/components/np-config-provider/#多语言)；也可以在 `NpConfigProvider` 的 `Table.operation` 中全局配置。

> 注意：内置 `del.label` 是渲染 `NText type="error"` 的函数，示例中直接传字符串会替换该渲染函数，删除项将失去红色文字样式；需要保留时请自行渲染 `NText type="error"`。

## 类型定义

### operation

```ts
operation?:
  | false
  | {
      label?: string
      width?: number | string
      prefixRender?: (rowData: T, rowIndex: number) => VNode
      suffixRender?: (rowData: T, rowIndex: number) => VNode
      options?: TableOperationOption[] | ((rowData: T, rowIndex: number) => TableOperationOption[])
      defaultOptions?: TableOperationDefaultOptions
      onSelect?: (key: string) => void | boolean
      onBefore?: (rowData: T, type: 'add' | 'edit' | 'del') => boolean | T | void | Promise<...>
    }
```

### TableOperationDefaultOptions

`Partial<Record<'edit' | 'del', Omit<TableOperationOption, 'type'>>>`，用于覆盖内置编辑 / 删除操作项的默认值（逐项合并）。

### TableOperationOption

| 字段    | 说明                                 | 类型                      |
| ------- | ------------------------------------ | ------------------------- |
| `type`  | 使用内置类型，复用编辑/删除逻辑      | `'edit'` \| `'del'`       |
| `key`   | 自定义选项标识，触发 `onSelect` 回调 | `string \| number`        |
| `label` | 自定义选项显示文字                   | `string \| (() => VNode)` |

> 可同时混合内置 type 与自定义 key，例如 `[{ type: 'edit' }, { type: 'del' }, { key: 'export', label: '导出' }]`。
