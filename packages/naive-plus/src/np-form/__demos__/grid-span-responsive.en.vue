<template>
  <!-- Drag the splitter to narrow the form container so the span change is visible -->
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
  // Columns stay at 24; span uses responsive values
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
    // Takes the whole row by default, and 12 columns at ≥600px to sit side by side
    { label: 'Name', key: 'fullName', formItemProps: { span: '24 600:12' } },
    {
      label: 'Phone',
      key: 'tel',
      type: 'number',
      formItemProps: { span: '24 400:12 600:6' },
    },
    {
      label: 'Email',
      key: 'email',
      formItemProps: { span: '24 400:12 600:6' },
    },
    {
      label: 'Address',
      key: 'address',
      type: 'textarea',
    },
  ],
}
</script>
