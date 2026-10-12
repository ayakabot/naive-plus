<template>
  <np-table :option="option" />
</template>

<script setup lang="ts">
import type { TableOption } from 'naive-plus'

type User = {
  id: number
  name: string
  gender: 'man' | 'feman'
  age: number
  address: string
}

const mockData: User[] = [
  { id: 1, name: 'John', gender: 'man', age: 30, address: 'New York' },
  { id: 2, name: 'Jane', gender: 'feman', age: 25, address: 'Los Angeles' },
  { id: 3, name: 'Bob', gender: 'man', age: 35, address: 'Chicago' },
]

const option: TableOption<User> = {
  columns: [
    {
      key: 'name',
      label: 'Name',
      formProps: { type: 'input' },
    },
    {
      key: 'gender',
      label: 'Gender',
      formProps: {
        type: 'radio',
        defaultValue: 'man',
        options: [
          { label: 'Male', value: 'man' },
          { label: 'Female', value: 'feman' },
        ],
      },
    },
    {
      key: 'age',
      label: 'Age',
      formProps: {
        type: 'number',
        // Only shown in the form when gender is "Male"
        display: data => data.gender === 'man',
      },
    },
    {
      key: 'address',
      label: 'Address',
      formProps: { type: 'input' },
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
