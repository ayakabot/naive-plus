---
permalink: /table/selection/
---

# np-table 多选

通过 `option.selection` 开启多选，可通过 `option.selection.onChange` 获取选中项变化。

> 注意：需将 `option` 定义为 `computed`，以保证 `checkedRowKeys` 的响应式更新能同步到表格。

<demo src="../__demos__/selection.vue"></demo>
