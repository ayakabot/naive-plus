<template>
  <np-form :option="option" />
</template>
<script setup lang="ts">
import type { FormOption } from 'naive-plus'

const option: FormOption = {
  onSubmit: async () => {
    // 模拟接口异常，异常信息会显示在提交按钮所在的表单项上
    await new Promise(resolve => setTimeout(resolve, 800))
    throw new Error('用户名已存在，请更换后重试')
  },
  columns: [
    { label: '用户名', key: 'username', defaultValue: 'admin' },
    { label: '手机号', key: 'tel', type: 'number' },
  ],
}
</script>
