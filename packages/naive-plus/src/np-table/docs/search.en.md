---
permalink: /en/table/search/
lang: en-US
---

# np-table Search

Configure a search input via `search`. It renders at the leftmost of the table header (`headerLeft` area) and coexists with the `headerLeft` slot content.

<demo src="../__demos__/search.en.vue"></demo>

## Basic Usage

```ts
import type { TableOption } from 'naive-plus'

const option: TableOption = {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
  ],
  search: {
    key: 'keyword',
    placeholder: 'Search name',
  },
  api: {
    fetch: async ({ page, pageSize }, { keyword }) => {
      // keyword is the search input value
      return { items: [], itemCount: 0 }
    },
  },
}
```

The search value is merged into the second argument of `api.fetch` under `search.key` (defaults to `keyword`), coexisting with `filters` and `tableRef.params`. The field is removed when the input is cleared.

## Auto Search

The input watches value changes and triggers a search automatically, no Enter key or click needed. Use `debounce` to control the debounce time (default 300ms) to avoid frequent requests while typing.

```ts
const option: TableOption = {
  // ...
  search: {
    debounce: 500,
  },
}
```

## Types

```ts
import type { TableSearchOption } from 'naive-plus'
```

### TableSearchOption

| Prop        | Description                                                          | Type               | Default                |
| ----------- | -------------------------------------------------------------------- | ------------------ | ---------------------- |
| key         | Query param name passed to `api.fetch`                               | string             | `keyword`              |
| placeholder | Input placeholder                                                    | string             | `Table.search.placeholder` of the locale |
| width       | Input width                                                          | `string \| number` | `220`                  |
| clearable   | Whether the input is clearable                                       | boolean            | `true`                 |
| debounce    | Debounce time (ms); search triggers automatically after typing stops | number             | `300`                  |
| props       | Other props passed through to `n-input`                              | `InputProps`       | -                      |
