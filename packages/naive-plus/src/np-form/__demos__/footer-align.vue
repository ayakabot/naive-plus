<template>
  <np-form :option="option" />
</template>
<script setup lang="tsx">
import type { FormOption } from 'naive-plus'

const option: FormOption = {
  footer: {
    // 底部内容靠右对齐，校验反馈信息同步靠右
    align: 'right',
  },
  // 提交异常时，错误信息会展示在底部表单项的校验反馈中
  onSubmit: () => {
    throw new Error('提交失败，请稍后重试')
  },
  columns: [
    { label: '姓名', key: 'fullName' },
    { label: '电话', key: 'tel', type: 'number' },
  ],
}
</script>
