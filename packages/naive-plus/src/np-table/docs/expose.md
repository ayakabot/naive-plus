---
permalink: /table/expose/
---

# np-table 主动方法

通过 `ref` 获取表格实例后，可调用以下主动方法。

- `reload`：重新加载数据，会重置到第一页。
- `refresh`：重新刷新当前页数据。
- `params`：绑定的查询参数，会作为 `queryParams` 传递给 `api.fetch`。

<demo src="../__demos__/expose.vue"></demo>

## 组件配置

### NpTableInst methods

| 方法    | 说明                                                       | 类型                    |
| ------- | ---------------------------------------------------------- | ----------------------- |
| reload  | 重新加载数据，会重置到第一页                               | `() => Promise<void>`   |
| refresh | 重新刷新当前页数据                                         | `() => Promise<void>`   |
| params  | 绑定的查询参数，会作为 `queryParams` 传递给 `api.fetch`    | `Record<string, any>`   |
