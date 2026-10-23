<template>
  <!-- 拖拽分割条压缩表单容器宽度，便于观察 span 随容器宽度变化 -->
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
  // 列数固定为 24，span 使用响应式写法
  grid: {
    cols: 24,
    xGap: 16,
  },
  footer: {
    submitBtn: {
      props: { block: true },
    },
    resetBtn: false,
  },
  columns: [
    // 默认占满整行，≥600px 时占 12 列，与下一个表单项并排
    { label: '姓名', key: 'fullName', formItemProps: { span: '24 600:12' } },
    // ≥400px 时占 12 列，≥600px 时占 6 列，可与邮箱并排展示三项
    {
      label: '电话',
      key: 'tel',
      type: 'number',
      formItemProps: { span: '24 400:12 600:6' },
    },
    { label: '邮箱', key: 'email', formItemProps: { span: '24 400:12 600:6' } },
    {
      label: '地址',
      key: 'address',
      type: 'textarea',
    },
  ],
}
</script>
