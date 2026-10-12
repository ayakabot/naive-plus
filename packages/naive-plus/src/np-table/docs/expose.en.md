---
permalink: /en/table/expose/
lang: en-US
---

# np-table Imperative Methods

Get the table instance through `ref`, then call the following imperative methods.

- `reload`: Reload the data, resetting to the first page.
- `refresh`: Refresh the data of the current page.
- `params`: Bound query params, passed to `api.fetch` as `queryParams`.

<demo src="../__demos__/expose.en.vue"></demo>

## Component Configuration

### NpTableInst methods

| Method  | Description                                                | Type                  |
| ------- | ---------------------------------------------------------- | --------------------- |
| reload  | Reload the data, resetting to the first page               | `() => Promise<void>` |
| refresh | Refresh the data of the current page                       | `() => Promise<void>` |
| params  | Bound query params, passed to `api.fetch` as `queryParams` | `Record<string, any>` |
