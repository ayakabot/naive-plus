<script setup lang="ts">
import type { NpComponentOptions } from '../index'
import { NpConfigProvider } from '../index'

// Set default props for components in one place
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
      <span>config-provider sets primary + small</span>
      <div style="display: flex; gap: 8px">
        <np-button>Default</np-button>
        <np-button type="error" :props="{ size: 'medium' }">
          Set props
        </np-button>
      </div>
      <span>config-provider sets hover + arrow = true</span>
      <np-cell label="Cell defaults to hover + arrow" value="Default" />
      <np-cell
        label="Component prop wins"
        value="Set props"
        :hover="false"
        :arrow="false"
      />
    </div>
  </NpConfigProvider>
</template>
