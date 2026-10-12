<template>
  <np-table :option="option">
    <template #headerLeft>
      <n-text strong style="font-size: 16px">用户列表</n-text>
    </template>
    <template #headerRight>
      <n-button secondary @click="handleExport">导出</n-button>
    </template>
    <template #footerLeft>
      <n-text depth="3">共 {{ total }} 条数据</n-text>
    </template>
  </np-table>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import type { TableOption } from 'naive-plus'

type User = {
  id: number
  name: string
  age: number
  address: string
}

const message = useMessage()

const mockData: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  age: 20 + (i % 30),
  address: `城市 ${i + 1}`,
}))

const total = mockData.length

const option: TableOption<User> = {
  columns: [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年龄' },
    { key: 'address', label: '地址' },
  ],
  api: {
    fetch: async ({ page, pageSize }) => {
      return {
        items: mockData.slice((page - 1) * pageSize, page * pageSize),
        itemCount: mockData.length,
      }
    },
  },
}

const handleExport = () => {
  message.success(`导出 ${total} 条数据`)
}
</script>
