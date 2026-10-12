<template>
  <div>
    <n-space style="margin-bottom: 12px">
      <n-input
        v-model:value="keyword"
        placeholder="Enter keyword"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      />
      <n-button type="primary" @click="handleSearch">Search</n-button>
      <n-button @click="handleRefresh">Refresh page</n-button>
    </n-space>
    <np-table ref="tableRef" :option="option" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NInput, NSpace } from 'naive-ui'
import type { NpTableInst, TableOption } from 'naive-plus'

type User = {
  id: number
  name: string
  age: number
  address: string
}

const mockData: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  age: 20 + (i % 30),
  address: `City ${i + 1}`,
}))

const tableRef = ref<NpTableInst>()
const keyword = ref('')

const option: TableOption<User> = {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'address', label: 'Address' },
  ],
  api: {
    // the second argument queryParams is the params bound through tableRef.params
    fetch: async ({ page, pageSize }, queryParams) => {
      await new Promise<void>(resolve => setTimeout(resolve, 300))

      let items = [...mockData]
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

// Set params then call reload: it resets to the first page and refetches with the params
const handleSearch = () => {
  tableRef.value!.params = { keyword: keyword.value }
  tableRef.value!.reload()
}

// refresh refetches while keeping the current page
const handleRefresh = () => {
  tableRef.value!.refresh()
}
</script>
