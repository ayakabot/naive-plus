---
permalink: /en/components/np-cell/
lang: en-US
---

# NpCell

Cell component.

## Basic Usage

Use `type` to specify the control type. Supports `checkbox` / `radio` / `switch` controls, icons and right arrows.

<demo src="../__demos__/basic.en.vue"></demo>

## Size

Use `size` to set the size.

<demo src="../__demos__/size.en.vue"></demo>

## Bottom Border

Use `bordered` to show the bottom border.

<demo src="../__demos__/bordered.en.vue"></demo>

## Props

| Prop | Description | Type | Default |
| ------- | -------------- | ------------------------------------ | ------- |
| v-model:checked | Checked state of the control | `boolean` | `false` |
| type | Control type on the left | `'checkbox' \| 'radio' \| 'switch'` | - |
| hover | Whether to enable hover state | `boolean` | `true` if `type` is set, otherwise `false` |
| icon | Left icon | `VNode \| () => VNode` | - |
| label | Cell label | `string \| VNode \| () => VNode` | - |
| value | Cell value | `string \| VNode \| () => VNode` | - |
| description | Cell description | `string \| VNode \| () => VNode` | - |
| arrow | Whether to show the right arrow | `boolean` | `false` |
| bordered | Whether to show the bottom border of the content area | `boolean` | `false` |
| size | Cell size | `'small' \| 'medium' \| 'large'` | `'medium'` |

## Slots

| Name | Description |
| ------- | ---------------- |
| footer | Bottom content, displayed below the main content area |

## Events

| Event | Description | Callback |
| -------------- | -------------------- | ------------------------- |
| update:checked | Triggered when the control state changes | `(value: boolean) => void` |

## Global Defaults

Use [NpConfigProvider](/en/components/np-config-provider/) to change the default props globally. Props passed to the component itself always win.

```vue
<np-config-provider :component-options="{ Cell: { size: 'large', arrow: true } }">
  <np-cell label="Cell" />
</np-config-provider>
```
