<template>
  <np-form :option="option" />
</template>
<script setup lang="tsx">
import type { FormOption } from 'naive-plus'

const option: FormOption = {
  // Configure columns and gaps of n-grid; form items are rendered with n-form-item-gi
  grid: {
    cols: 24,
    xGap: 16,
    yGap: 16,
  },
  columns: [
    // Use formItemProps.span to set the span, defaults to the whole row
    { label: 'Name', key: 'fullName', formItemProps: { span: 12 } },
    { label: 'Phone', key: 'tel', type: 'number', formItemProps: { span: 12 } },
    { label: 'Email', key: 'email', formItemProps: { span: 24 } },
    {
      label: 'Address',
      key: 'address',
      type: 'textarea',
      formItemProps: { span: 24 },
    },
  ],
}
</script>
