<template>
  <np-table :option="option" />
</template>

<script setup lang="ts">
import type { TableOption } from 'naive-plus'

const mockData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  age: 20 + (i % 30),
  status: i % 3 === 0 ? 'enabled' : i % 3 === 1 ? 'disabled' : 'pending',
}))

const option: TableOption = {
  columns: [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年龄' },
    { key: 'status', label: '状态' },
  ],
  search: {
    key: 'keyword',
    placeholder: '搜索姓名',
  },
  api: {
    fetch: async ({ page, pageSize }, queryParams) => {
      await new Promise<void>(resolve => setTimeout(resolve, 500))

      let items = [...mockData]

      // 根据搜索关键词过滤
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
