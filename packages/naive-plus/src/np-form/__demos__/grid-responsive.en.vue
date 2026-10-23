<template>
  <!-- Drag the splitter to narrow the form container so the column change is visible -->
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
  // Columns change with the container width: 1 by default, 2 at ≥400px, 3 at ≥600px
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
    // With span 1, items sit side by side in the 2 / 3 column layouts
    { label: 'Name', key: 'fullName', formItemProps: { span: 1 } },
    { label: 'Phone', key: 'tel', type: 'number', formItemProps: { span: 1 } },
    { label: 'Email', key: 'email', formItemProps: { span: 1 } },
    // Without span, the item takes the whole row
    { label: 'Address', key: 'address', type: 'textarea' },
  ],
}
</script>
