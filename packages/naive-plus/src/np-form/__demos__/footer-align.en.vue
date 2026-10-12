<template>
  <np-form :option="option" />
</template>
<script setup lang="tsx">
import type { FormOption } from 'naive-plus'

const option: FormOption = {
  footer: {
    // Align the footer content to the end, including the validation feedback
    align: 'right',
  },
  // The error message is shown as the feedback of the footer form item
  onSubmit: () => {
    throw new Error('Submit failed, please try again later')
  },
  columns: [
    { label: 'Name', key: 'fullName' },
    { label: 'Phone', key: 'tel', type: 'number' },
  ],
}
</script>
