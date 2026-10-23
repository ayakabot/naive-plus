<template>
  <np-form :option="option" />
</template>
<script setup lang="tsx">
import type { FormOption } from 'naive-plus'

const option: FormOption = {
  // 配置 n-grid 的列数与间距，表单项统一使用 n-form-item-gi 渲染
  grid: {
    cols: 24,
    xGap: 16,
    yGap: 16,
  },
  columns: [
    // 通过 formItemProps.span 指定占据的栅格数，未指定时占满整行
    { label: '姓名', key: 'fullName', formItemProps: { span: 12 } },
    { label: '电话', key: 'tel', type: 'number', formItemProps: { span: 12 } },
    { label: '邮箱', key: 'email', formItemProps: { span: 24 } },
    {
      label: '地址',
      key: 'address',
      type: 'textarea',
      formItemProps: { span: 24 },
    },
  ],
}
</script>
