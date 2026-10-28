---
permalink: /en/components/np-cell-group/
lang: en-US
---

# NpCellGroup

A cell group that batch-renders NpCell via the `options` config, with optional group title.

## Basic Usage

`options` supports a subset of `np-cell` props, see `NpCellGroupOption` below.

<demo src="../__demos__/group.en.vue"></demo>

## Props

| Prop | Description | Type | Default |
| ------- | -------------- | --------------------- | ------ |
| title | Group title | `string` | - |
| options | Cell config list | `NpCellGroupOption[]` | `[]` |
| type | Control type on the left | `'checkbox' \| 'radio' \| 'switch'` | - |
| size | Size | `'small' \| 'medium' \| 'large'` | `medium` |
| bordered | Whether to show dividers | `boolean` | `false` |

## NpCellGroupOption

| Prop | Description | Type | Default |
| ------- | ---------------------- | ----------------------------------- | ------- |
| key | Option identifier | `string \| number` | current index |
| icon | Left icon | `VNode \| () => VNode` | - |
| label | Cell label | `string \| VNode \| () => VNode` | - |
| value | Cell value | `string \| VNode \| () => VNode` | - |
| description | Cell description | `string \| VNode \| () => VNode` | - |
| footer | Bottom content | `VNode \| () => VNode` | - |
| hover | Whether to enable hover state, falls back to the `Cell` config of `NpConfigProvider` when omitted | `boolean` | - |
| arrow | Whether to show the right arrow, falls back to the `Cell` config of `NpConfigProvider` when omitted | `boolean` | `false` (when no `Cell` config) |
| onClick | Click callback | `() => void` | - |

## Events

| Event | Description | Callback |
| ------ | ------------------ | ---------------------------- |
| change | Triggered when the selection changes | `(keys: NpCellGroupKeys, item: NpCellGroupOption) => void` |
| update:keys | Triggered when the control state changes | `(keys: NpCellGroupKeys) => void` |

## Global Defaults

Use [NpConfigProvider](/en/components/np-config-provider/) to change the default `size` / `bordered`. Props passed to the component itself always win; when `hover` / `arrow` are not set on an option, they fall back to the `Cell` config of `NpConfigProvider`.

```vue
<np-config-provider
  :component-options="{ CellGroup: { size: 'small', bordered: true } }"
>
  <np-cell-group :options="options" />
</np-config-provider>
```
