<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NConfigProvider,
  NRadioButton,
  NRadioGroup,
  enUS,
  zhCN,
} from 'naive-ui'
import type { FormOption, TableOption } from 'naive-plus'
import type { NpLocale } from '../index'
import { NpConfigProvider } from '../index'

const locale = ref<NpLocale>('en')
/** Locale of naive-ui components, kept in sync with np components */
const naiveLocale = computed(() => (locale.value === 'zh' ? zhCN : enUS))

const formOption: FormOption = {
  columns: [{ label: 'Name', key: 'name' }],
}

const tableOption: TableOption = {
  api: {
    fetch: async () => ({
      items: [{ id: 1, name: 'Naive Plus' }],
      itemCount: 1,
    }),
  },
  columns: [{ key: 'name', label: 'Name' }],
  search: {},
}
</script>

<template>
  <NConfigProvider :locale="naiveLocale">
    <div style="display: flex; flex-direction: column; gap: 12px">
      <NRadioGroup v-model:value="locale">
        <NRadioButton value="zh">中文</NRadioButton>
        <NRadioButton value="en">English</NRadioButton>
      </NRadioGroup>
      <NpConfigProvider :locale="locale">
        <np-form :option="formOption" />
        <np-table :option="tableOption" />
      </NpConfigProvider>
    </div>
  </NConfigProvider>
</template>
