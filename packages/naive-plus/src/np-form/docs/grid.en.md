---
permalink: /en/form/grid/
lang: en-US
---

# np-form Grid Layout

`np-form` always uses the grid layout: form items are rendered with `n-form-item-gi` and their `span` defaults to the whole row (24 columns), so they look the same as regular form items.

Use `option.grid` to configure `n-grid` (columns, gaps, etc.). The footer also takes the whole row.

<demo src="../__demos__/grid.en.vue"></demo>

## Responsive

`cols`, `xGap`, `yGap` in `option.grid` and `formItemProps.span` / `formItemProps.offset` all support responsive values in the form `'default breakpoint:value ...'`. Breakpoints can be raw pixel values such as `'1 400:2 600:3'` (1 column by default, 2 at `≥400px`, 3 at `≥600px`).

The built-in named breakpoints `xs` / `s` / `m` / `l` / `xl` / `xxl` (i.e. `0px` / `640px` / `1024px` / `1280px` / `1536px` / `1920px`) are also available, but **you must explicitly set `grid.responsive: 'screen'`**; the default `'self'` mode matches against the container width (a number), so named breakpoints never take effect.

> Never use `0` as the default value in a responsive string: `n-grid` skips children whose `span` is `0`, so the form item won't be rendered at all.

### Responsive columns

When the column count changes with the container width, an item's `span` follows `cols` by default, and can also be set explicitly.

<demo src="../__demos__/grid-responsive.en.vue"></demo>

### Responsive span

When `cols` stays fixed (e.g. `24`), just use responsive values for `span` — `itemResponsive` is enabled by default.

<demo src="../__demos__/grid-span-responsive.en.vue"></demo>

## Configuration

- `option.grid` is passed through to `n-grid`. Common options: `cols` (number of columns, defaults to `24`), `xGap` / `yGap` (horizontal / vertical gaps); `collapsed`, `responsive` and responsive values (e.g. `'1 400:2 600:3'`) are also supported
- Set `formItemProps.span` for the span of a form item and `formItemProps.offset` for its left offset. **When `span` is omitted, the item takes the whole row**
- `offset` must be used together with `span`: `n-grid` turns `offset` into a left margin added on top of `span`, so setting only `offset` without `span` (which defaults to the whole row) shifts the full-width item to the right and overflows the container. To leave space on the left, set `span` as well, e.g. `{ span: 22, offset: 2 }`
- `itemResponsive` is enabled by default, so responsive `span` / `offset` work out of the box; `itemResponsive: false` turns it off, but only when `cols` / `xGap` / `yGap` are all fixed numbers — otherwise `n-grid` still resolves `span` / `offset` against the container width
- The footer takes the whole row by default; override it with `footer.formItemProps.span`

> Form items with `display: false` (except `render` columns) render no content and take no grid cell (they are still counted by the overflow calculation of `collapsed` rows); columns rendered by `render` are automatically wrapped with `n-gi`.

## Component Configuration

### FormOption Props

| Prop | Description                                    | Type   | Default |
| ---- | ---------------------------------------------- | ------ | ------- |
| grid | Grid layout config, passed through to `n-grid` | object | -       |

### FormColumn Props

| Prop                 | Description                       | Type            | Default   |
| -------------------- | --------------------------------- | --------------- | --------- |
| formItemProps.span   | Grid columns occupied by the item | number / string | whole row |
| formItemProps.offset | Grid columns of the left offset   | number / string | 0         |
