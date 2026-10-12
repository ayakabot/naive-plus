---
permalink: /form/footer/
---

# np-form 自定义底部

通过 `footer` 属性自定义底部。

<demo src="../__demos__/footer.vue"></demo>

## 右对齐

通过 `align="right"` 让底部内容靠右对齐，提交异常时的校验反馈也会同步靠右。

<demo src="../__demos__/footer-align.vue"></demo>

## 组件配置

### FormOption Props

| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| footer | 底部属性，`false` 则隐藏整个底部 | boolean / [FooterProps](#footer-props) | - |

### Footer Props

| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| submitBtn | 提交按钮是否显示 | boolean | true |
| resetBtn | 重置按钮是否显示 | boolean | true |
| submitErrorFeedback | 提交（onSubmit）异常时，是否将错误信息展示在底部表单项的校验反馈中 | boolean | true |
| align | 底部内容对齐方式，`right` 时靠右对齐且校验反馈同步靠右 | `'left' \| 'right'` | `'left'` |
| prefixRender | 前缀渲染函数 | `(data)=>VNode` | - |
| suffixRender | 后缀渲染函数 | `(data)=>VNode` | - |
