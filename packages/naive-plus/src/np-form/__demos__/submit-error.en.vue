<template>
  <np-form :option="option" />
</template>
<script setup lang="ts">
import type { FormOption } from 'naive-plus'

const option: FormOption = {
  onSubmit: async () => {
    // Simulate an api error, the message will be shown on the footer form item
    await new Promise(resolve => setTimeout(resolve, 800))
    throw new Error('Username already exists, please try another one')
  },
  columns: [
    { label: 'Username', key: 'username', defaultValue: 'admin' },
    { label: 'Phone', key: 'tel', type: 'number' },
  ],
}
</script>
