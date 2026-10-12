<template>
  <div>
    <n-space style="margin-bottom: 12px">
      <n-input
        v-model:value="keyword"
        placeholder="请输入关键字"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      />
      <n-button type="primary" @click="handleSearch">搜索</n-button>
      <n-button @click="handleRefresh">刷新当前页</n-button>
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
  name: `用户 ${i + 1}`,
  age: 20 + (i % 30),
  address: `城市 ${i + 1}`,
}))

const tableRef = ref<NpTableInst>()
const keyword = ref('')

const option: TableOption<User> = {
  columns: [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年龄' },
    { key: 'address', label: '地址' },
  ],
  api: {
    // 第二个参数 queryParams 即通过 tableRef.params 绑定的参数
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

// 设置 params 后调用 reload，会重置到第一页并携带参数重新请求
const handleSearch = () => {
  tableRef.value!.params = { keyword: keyword.value }
  tableRef.value!.reload()
}

// refresh 保持当前页重新请求
const handleRefresh = () => {
  tableRef.value!.refresh()
}
</script>
