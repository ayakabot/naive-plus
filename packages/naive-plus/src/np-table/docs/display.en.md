---
permalink: /en/table/display/
lang: en-US
---

# Display Control

`np-table` supports visibility control for both table columns and form fields, configured via the column's `display` and `formProps.display` respectively.

## Hiding a Table Column

Use the column's `display` to control whether the column is shown, defaulting to `true`. Columns set to `false` are **completely hidden** from the table and do not appear in the "Display Settings" popover. This is commonly used for fields that only appear in the add / edit form.

<demo src="../__demos__/column-display.en.vue"></demo>

> The "Display Settings" button at the top right toggles the visibility of columns at runtime (for columns without `display: false`), keeping at least one column visible.

Combined with `formProps.addProps` / `formProps.editProps`, a field can be shown only in a specific action mode. For example, a field that only exists in the edit form (hidden in the table and the add form):

```ts
{
  key: 'remark',
  label: 'Remark',
  display: false, // hidden entirely in the table
  formProps: {
    type: 'input',
    addProps: { display: false }, // also hidden in the add form, only shown when editing
  },
}
```

> The "Remark" field in the "Hiding a Table Column" example above demonstrates this: visible when clicking "Edit", hidden when clicking "Add".


## Form Field Visibility

The visibility of CRUD form fields is controlled by the column's `formProps.display`, which accepts a boolean or a function. The function receives the current form data, so fields can be shown or hidden dynamically based on other fields.

<demo src="../__demos__/display.en.vue"></demo>

## Types

### TableColumn.display

| Prop    | Description                 | Type      | Default |
| ------- | --------------------------- | --------- | ------- |
| display | Whether to display the column in the table; `false` hides it entirely | `boolean` | true    |

### TableColumn.formProps.display

| Prop    | Description                        | Type                          | Default |
| ------- | ---------------------------------- | ----------------------------- | ------- |
| display | Whether to display the form field  | `boolean / (data) => boolean` | true    |
