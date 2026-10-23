<template>
  <!-- 拖拽分割条压缩表单容器宽度，便于观察列数随容器宽度变化 -->
  <n-split :default-size="1">
    <template #1>
      <np-form :option="option" />
    </template>
    <template #2></template>
  </n-split>
</template>
<script setup lang="tsx">
import type { FormOption } from 'naive-plus'
import { NSplit } from 'naive-ui'

const option: FormOption = {
  // 列数随容器宽度响应式变化：默认 1 列，≥400px 2 列，≥600px 3 列
  grid: {
    cols: '1 400:2 600:3',
    xGap: 16,
  },
  footer: {
    submitBtn: {
      props: { block: true },
    },
    resetBtn: false,
  },
  columns: [
    // span 为 1 时，在 2 / 3 列布局下并排展示
    { label: '姓名', key: 'fullName', formItemProps: { span: 1 } },
    { label: '电话', key: 'tel', type: 'number', formItemProps: { span: 1 } },
    { label: '邮箱', key: 'email', formItemProps: { span: 1 } },
    // 未指定 span 时占满整行
    { label: '地址', key: 'address', type: 'textarea' },
  ],
}
</script>
