---
permalink: /en/form/base/
lang: en-US
---

# np-form Form

A configuration-driven form that dynamically generates the form through `columns`, simple to use and highly extensible.

## Basic Usage

Form fields are mainly configured with `label`, `key`, `type` to set the form label, form field and field type. More config depends on the `props` of the actual type once `type` is set.

<demo src="../__demos__/basic.en.vue"></demo>

## Component Configuration

### Props

| Prop | Description | Type | Default |
| ---- | ---- | ---- | ---- |
| option | Configuration | [FormOption](#formoption) | - |

### Methods

After getting the form instance via `ref`, you can imperatively call the following methods. See [Imperative Methods](/en/form/imperative/).

| Method | Description | Type |
| ---- | ---- | ---- |
| submit | Submit the form manually | `() => Promise<void>` |
| reset | Reset the form and trigger `onReset` | `() => Promise<void>` |
| validateFields | Validate the given fields, supports `__` prefix matching | `(fields: string \| string[]) => Promise<void>` |

## Types

The component exports the following type definitions:

```ts
import type { FormOption } from 'naive-plus'
```

### FormOption

| Prop | Description | Type | Default |
| ---- | ---- | ---- | ---- |
| columns | Form fields | Array<[FormColumn](#formcolumn)> | - |
| onSubmit | Submit event | `(data)=>Promise<void>` | - |
| onReset | Reset event | `(data)=>Promise<void>` | - |
| props | Form props | object | - |
| grid | Grid layout config, see [Grid Layout](/en/form/grid/) | object | - |

### FormColumn

| Prop | Description | Type | Default |
| ---- | ---- | ---- | ---- |
| label | Field label | string / VNode | - |
| key | Form field name | string | - |
| type | Form field type | string / `(data)=>VNode` | - |
| defaultValue | Default value | any | - |
| options | Dictionary options, e.g. checkbox, select, etc. | `Array<any>` / `()=>Promise<Array<any>>` | - |
| props | Component props, passed through to the actual component | object | - |
| formItemProps | Form item props, passed through to `n-form-item-gi`; supports `span` / `offset` | object | - |

## Global Defaults

Use [NpConfigProvider](/en/components/np-config-provider/) to configure `enterSubmitMode` / `grid` / `props` and the default `column` of every form item. The same config in `option` always wins.

```vue
<np-config-provider
  :component-options="{
    Form: {
      enterSubmitMode: 'all',
      grid: { cols: 24, xGap: 12 },
      props: { labelWidth: 100 },
      column: { formItemProps: { labelWidth: 100 }, props: { size: 'small' } },
    },
  }"
>
  <np-form v-model="data" :option="option" />
</np-config-provider>
```
