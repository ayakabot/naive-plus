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
    remark: 'VIP 用户',
  },
  {
    id: 2,
    name: 'Jane',
    age: 25,
    address: 'Los Angeles',
    email: 'jane@example.com',
    remark: '普通用户',
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
      label: '姓名',
      formProps: { type: 'input' },
    },
    {
      key: 'age',
      label: '年龄',
      formProps: { type: 'number' },
    },
    {
      key: 'address',
      label: '地址',
      formProps: { type: 'input' },
    },
    {
      key: 'email',
      label: '邮箱',
      // display: false 表示该列在表格中彻底隐藏，
      // 常用于只在新增 / 编辑表单中使用的字段
      display: false,
      formProps: { type: 'input' },
    },
    {
      key: 'remark',
      label: '备注',
      // 表格中不显示
      display: false,
      formProps: {
        type: 'input',
        // 新增表单中也不显示，仅在编辑表单中显示
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
