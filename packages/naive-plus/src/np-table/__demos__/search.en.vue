<template>
  <np-table :option="option" />
</template>

<script setup lang="ts">
import type { TableOption } from 'naive-plus'

const mockData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  age: 20 + (i % 30),
  status: i % 3 === 0 ? 'enabled' : i % 3 === 1 ? 'disabled' : 'pending',
}))

const option: TableOption = {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'status', label: 'Status' },
  ],
  search: {
    key: 'keyword',
    placeholder: 'Search name',
  },
  api: {
    fetch: async ({ page, pageSize }, queryParams) => {
      await new Promise<void>(resolve => setTimeout(resolve, 500))

      let items = [...mockData]

      // filter by keyword
      if (queryParams.keyword) {
        items = items.filter(item => item.name.includes(queryParams.keyword))
      }

      return {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        itemCount: items.length,
      }
    },
  },
}
</script>
