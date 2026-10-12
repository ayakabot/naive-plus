<template>
  <np-table :option="option" />
</template>

<script setup lang="ts">
import type { TableOption } from 'naive-plus'

type User = {
  id: number
  name: string
  age: number
  address: string
  email: string
  remark?: string
}

const mockData: User[] = [
  {
    id: 1,
    name: 'John',
    age: 30,
    address: 'New York',
    email: 'john@example.com',
    remark: 'VIP user',
  },
  {
    id: 2,
    name: 'Jane',
    age: 25,
    address: 'Los Angeles',
    email: 'jane@example.com',
    remark: 'Regular user',
  },
  {
    id: 3,
    name: 'Bob',
    age: 35,
    address: 'Chicago',
    email: 'bob@example.com',
  },
]

const option: TableOption<User> = {
  columns: [
    {
      key: 'name',
      label: 'Name',
      formProps: { type: 'input' },
    },
    {
      key: 'age',
      label: 'Age',
      formProps: { type: 'number' },
    },
    {
      key: 'address',
      label: 'Address',
      formProps: { type: 'input' },
    },
    {
      key: 'email',
      label: 'Email',
      // display: false hides the column entirely in the table,
      // commonly used for fields that only appear in the add / edit form
      display: false,
      formProps: { type: 'input' },
    },
    {
      key: 'remark',
      label: 'Remark',
      // Not shown in the table
      display: false,
      formProps: {
        type: 'input',
        // Also hidden in the add form, only shown in the edit form
        addProps: { display: false },
      },
    },
  ],
  api: {
    fetch: async ({ page, pageSize }) => {
      return {
        items: mockData.slice((page - 1) * pageSize, page * pageSize),
        itemCount: mockData.length,
      }
    },
    add: async rowData => {
      mockData.unshift({ ...rowData, id: mockData.length + 1 })
    },
    edit: async rowData => {
      const idx = mockData.findIndex(item => item.id === rowData.id)
      if (idx !== -1) {
        mockData[idx] = { ...mockData[idx], ...rowData }
      }
    },
    del: async rowData => {
      const idx = mockData.findIndex(item => item.id === rowData.id)
      if (idx !== -1) {
        mockData.splice(idx, 1)
      }
    },
  },
}
</script>
