---
permalink: /form/grid/
---

# np-form 栅格布局

`np-form` 始终使用栅格布局，表单项统一由 `n-form-item-gi` 渲染，默认 `span` 占满整行（24 列），因此视觉上与普通表单项一致。

通过 `option.grid` 可以配置 `n-grid`（列数、间距等），底部操作区同样占满整行。

<demo src="../__demos__/grid.vue"></demo>

## 响应式

`option.grid` 中的 `cols`、`xGap`、`yGap` 以及 `formItemProps.span`、`formItemProps.offset` 都支持响应式写法，格式为 `'默认值 断点:值 ...'`。断点可以直接写像素值，例如 `'1 400:2 600:3'` 表示默认 1 列、`≥400px` 2 列、`≥600px` 3 列。

也可以使用内置的命名断点 `xs` / `s` / `m` / `l` / `xl` / `xxl`（分别对应 `0px` / `640px` / `1024px` / `1280px` / `1536px` / `1920px`），但**必须显式设置 `grid.responsive: 'screen'`**；默认的 `'self'` 模式基于容器宽度（数值）匹配，命名断点不会生效。

> 响应式写法的默认值不要写 `0`：`n-grid` 会直接跳过 `span` 为 `0` 的子项，导致该表单项不渲染。

### 响应式列数

列数随容器宽度变化时，表单项的 `span` 默认跟随 `cols`，也可以单独指定。

<demo src="../__demos__/grid-responsive.vue"></demo>

### 响应式 span

当 `cols` 保持固定列数（如 `24`）时，`span` 直接使用响应式写法即可，`itemResponsive` 已默认开启。

<demo src="../__demos__/grid-span-responsive.vue"></demo>

## 配置说明

- `option.grid` 直接透传给 `n-grid`，常用配置：`cols`（列数，默认 `24`）、`xGap` / `yGap`（水平 / 垂直间距），也支持 `collapsed`、`responsive` 及响应式写法（如 `'1 400:2 600:3'`）
- 表单项占据的栅格数通过 `formItemProps.span` 设置，左侧间隔通过 `formItemProps.offset` 设置，**未指定 `span` 时默认占满整行**
- `offset` 需与 `span` 搭配使用：`n-grid` 会把 `offset` 换算成左外边距叠加在 `span` 上，只设置 `offset` 而不设置 `span`（默认占满整行）会让整行右移并撑出容器，产生水平溢出；需要左侧留白时请同时指定 `span`，例如 `{ span: 22, offset: 2 }`
- `itemResponsive` 默认开启，响应式 `span` / `offset` 开箱即用；传 `itemResponsive: false` 可关闭，但仅当 `cols` / `xGap` / `yGap` 均为固定数值时才会真正关闭，否则 `n-grid` 仍会按容器宽度解析 `span` / `offset`
- 底部操作区默认占满整行，可通过 `footer.formItemProps.span` 覆盖

> `display: false` 的表单项（`render` 自定义列除外）不会渲染内容，也不会占据栅格位置（但 `collapsed` 折叠行的溢出计算仍会将其计入）；`render` 自定义渲染的列会被自动包裹一层 `n-gi`。

## 组件配置

### FormOption Props

| 属性 | 说明                              | 类型   | 默认值 |
| ---- | --------------------------------- | ------ | ------ |
| grid | 栅格布局配置，直接透传给 `n-grid` | object | -      |

### FormColumn Props

| 属性                 | 说明               | 类型            | 默认值   |
| -------------------- | ------------------ | --------------- | -------- |
| formItemProps.span   | 栅格占据的列数     | number / string | 占满整行 |
| formItemProps.offset | 栅格左侧的间隔格数 | number / string | 0        |
