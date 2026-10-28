---
permalink: /en/table/operation/
lang: en-US
---

# Custom Operation Column

Use the `operation` config to flexibly control the display and behavior of the operation column.

## Hide the Operation Column

Set `operation` to `false` to hide both the operation column and the top "Add" button.

<demo src="../__demos__/operation-hide.en.vue"></demo>

## Prefix and Suffix Slots

Use `prefixRender` and `suffixRender` to insert custom content before and after the default action buttons.

<demo src="../__demos__/operation-render.en.vue"></demo>

## Custom Options and onSelect

Use `options` to configure dropdown menu items, and use `onSelect` to handle clicks on custom items.

- `{ type: 'edit' }` / `{ type: 'del' }` reuses the built-in edit/delete logic (triggers `onBefore`, opens the dialog, etc.)
- Custom `key` options trigger the `onSelect` callback on click

<demo src="../__demos__/operation-custom.en.vue"></demo>

## Dynamic Options

`options` also accepts a function to build dropdown items from the current row.

<demo src="../__demos__/operation-options-function.en.vue"></demo>

## Default Option Config

When `options` only contains `{ type: 'edit' }` / `{ type: 'del' }`, the built-in items are reused. Use `defaultOptions` to override their texts and props (merged per `edit` / `del`, so overriding only `label` keeps the built-in `key`), while the same fields in `options` take priority.

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

> Without `defaultOptions`, the texts come from the [locale](/en/components/np-config-provider/#locale) of `NpConfigProvider`; they can also be set globally through `Table.operation` of `NpConfigProvider`.

> Note: the built-in `del.label` is a render function that renders `NText type="error"`. Passing a string in the example above replaces that render function, so the delete item loses its red text style. Render `NText type="error"` yourself if you want to keep it.

## Types

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

`Partial<Record<'edit' | 'del', Omit<TableOperationOption, 'type'>>>`, used to replace the defaults of the built-in edit / delete items.

### TableOperationOption

| Field   | Description                                                | Type                      |
| ------- | ---------------------------------------------------------- | ------------------------- |
| `type`  | Built-in type, reuses the edit/delete logic                | `'edit'` \| `'del'`       |
| `key`   | Custom option identifier, triggers the `onSelect` callback | `string \| number`        |
| `label` | Custom option display label                                | `string \| (() => VNode)` |

> Built-in types and custom keys can be mixed, e.g. `[{ type: 'edit' }, { type: 'del' }, { key: 'export', label: 'Export' }]`.
