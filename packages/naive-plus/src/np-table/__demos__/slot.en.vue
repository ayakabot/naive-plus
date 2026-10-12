<template>
  <np-table :option="option">
    <template #headerLeft>
      <n-text strong style="font-size: 16px">User List</n-text>
    </template>
    <template #headerRight>
      <n-button secondary @click="handleExport">Export</n-button>
    </template>
    <template #footerLeft>
      <n-text depth="3">Total {{ total }} items</n-text>
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
  name: `User ${i + 1}`,
  age: 20 + (i % 30),
  address: `City ${i + 1}`,
}))

const total = mockData.length

const option: TableOption<User> = {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'address', label: 'Address' },
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
  message.success(`Exported ${total} items`)
}
</script>
