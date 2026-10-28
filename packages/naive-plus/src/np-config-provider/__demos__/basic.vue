<script setup lang="ts">
import type { NpComponentOptions } from '../index'
import { NpConfigProvider } from '../index'

// 统一调整组件 prop 默认值，避免在每处调用点重复书写
const componentOptions: NpComponentOptions = {
  Button: {
    type: 'primary',
    props: {
      size: 'small',
    },
  },
  Cell: {
    hover: true,
    arrow: true,
  },
}
</script>

<template>
  <NpConfigProvider :component-options="componentOptions">
    <div style="display: flex; flex-direction: column; gap: 12px">
      <span>config-provider 改为 primary + small</span>
      <div style="display: flex; gap: 8px">
        <np-button>默认</np-button>
        <np-button type="error" :props="{ size: 'medium' }">设置prop</np-button>
      </div>
      <span>config-provider 改为 hover + arrow = true</span>
      <np-cell label="单元格默认 hover + 箭头" value="默认值" />
      <np-cell
        label="组件自身 prop 优先级更高"
        value="设置prop"
        :hover="false"
        :arrow="false"
      />
    </div>
  </NpConfigProvider>
</template>
