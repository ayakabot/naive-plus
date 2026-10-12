---
permalink: /en/table/slot/
lang: en-US
---

# np-table Slots

Use slots to insert custom content at the top and bottom of the table.

## Header Slots

- `headerLeft`: content on the left of the table header
- `headerRight`: content on the right of the table header, rendered before the "Add" button and the filter, display and refresh buttons

## Footer Slot

- `footerLeft`: content on the left of the table footer, on the same row as the pagination

<demo src="../__demos__/slot.en.vue"></demo>

## Slot List

| Name        | Description                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------- |
| headerLeft  | Slot on the left of the table header                                                           |
| headerRight | Slot on the right of the table header, rendered before the "Add" and filter/display/refresh buttons |
| footerLeft  | Slot on the left of the table footer, on the same row as the pagination                        |

## option.slots

Besides component slots, the same positions can be configured through `option.slots`. When both exist, **`option.slots` takes precedence**.

```ts
import { h } from 'vue'
import { NButton } from 'naive-ui'
import type { TableOption } from 'naive-plus'

const option: TableOption = {
  // ...
  slots: {
    headerLeft: () => h('span', 'User List'),
    headerRight: () =>
      h(NButton, { secondary: true }, { default: () => 'Export' }),
    footerLeft: () => h('span', 'Total 100 items'),
  },
}
```

### TableSlotOption

| Prop        | Description                                                        | Type               |
| ----------- | ------------------------------------------------------------------ | ------------------ |
| headerLeft  | Content on the left of the header, takes precedence over the slot  | `() => VNodeChild` |
| headerRight | Content on the right of the header, takes precedence over the slot | `() => VNodeChild` |
| footerLeft  | Content on the left of the footer, takes precedence over the slot  | `() => VNodeChild` |
