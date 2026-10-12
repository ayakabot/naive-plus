---
permalink: /form/submit-error/
---

# np-form 提交异常反馈

提交（`onSubmit`）抛出异常时，错误信息默认会展示在底部按钮所在的表单项中，无需额外处理；设置 `footer.submitErrorFeedback: false` 可关闭该行为。

<demo src="../__demos__/submit-error.vue"></demo>

## 组件配置

### Footer Props

| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| submitErrorFeedback | 提交（onSubmit）异常时，是否将错误信息展示在底部表单项的校验反馈中 | boolean | true |
