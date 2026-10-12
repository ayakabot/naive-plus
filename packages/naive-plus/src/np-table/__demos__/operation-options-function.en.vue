<template>
  <div>
    <n-alert v-if="lastKey" type="success" style="margin-bottom: 12px">
      onSelect triggered, key =
      <strong>{{ lastKey }}</strong>
    </n-alert>
    <np-table :option="option" />
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue'
import { NAlert } from 'naive-ui'
import type { TableOption } from 'naive-plus'

type User = {
  id: number
  name: string
  age: number
  address: string
  locked?: boolean
}

const lastKey = ref('')

const mockData: User[] = [
  { id: 1, name: 'John', age: 30, address: 'New York' },
  { id: 2, name: 'Jane', age: 25, address: 'Los Angeles', locked: true },
  { id: 3, name: 'Bob', age: 35, address: 'Chicago' },
]

const option: TableOption<User> = {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'address', label: 'Address' },
  ],
  api: {
    fetch: async ({ page, pageSize }) => ({
      items: mockData.slice((page - 1) * pageSize, page * pageSize),
      itemCount: mockData.length,
    }),
  },
  operation: {
    label: 'Actions',
    // options accepts a function to build dropdown items from the current row
    options: (rowData, rowIndex) => [
      { type: 'edit' },
      { type: 'del', disabled: rowData.locked },
      { key: 'detail', label: `Detail ${rowIndex + 1}` },
    ],
    onSelect: key => {
      lastKey.value = key
    },
  },
}
</script>
