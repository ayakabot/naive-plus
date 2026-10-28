<template>
  <div :class="`${bemClass} ${bemClass}__${merged.size}`">
    <div v-if="props.title" :class="`${bemClass}__title`">
      {{ props.title }}
    </div>
    <NpCell
      v-for="(item, idx) in props.options"
      :key="`${idx}-${getKey(item, idx)}`"
      :label="item.label"
      :icon="item.icon"
      :value="item.value"
      :description="item.description"
      :hover="item.hover"
      :arrow="item.arrow"
      :type="props.type"
      :size="merged.size"
      :bordered="merged.bordered && idx < props.options.length - 1"
      :checked="selectedKeys.includes(getKey(item, idx))"
      :footer="item.footer"
      @click="handleClick(item, idx)"
    ></NpCell>
  </div>
</template>
<script setup lang="ts">
import { useCreate } from '../../_hooks/create'
import { useConfigProps } from '../../_hooks/config'
import {
  npCellGroupDefaults,
  npCellGroupProps,
  type NpCellGroupKey,
  type NpCellGroupKeys,
  type NpCellGroupOption,
} from './props'
import { NpCell } from '../../np-cell'
import { ref, watch } from 'vue'

const { bemClass } = useCreate('np-cell-group')

const props = defineProps(npCellGroupProps)

// prop > np-config-provider > 内置默认值
const merged = useConfigProps('CellGroup', props, npCellGroupDefaults)

const emit = defineEmits<{
  (e: 'update:keys', keys: NpCellGroupKeys): void
  (e: 'change', keys: NpCellGroupKeys, item: NpCellGroupOption): void
}>()

const selectedKeys = ref<NpCellGroupKeys>([])
watch(
  () => props.keys,
  () => {
    selectedKeys.value = [...(props.keys ?? [])]
  },
  { immediate: true, deep: true }
)

const getKey = (item: NpCellGroupOption, index: number): NpCellGroupKey => {
  return item.key === undefined ? index : item.key
}

const handleClick = (item: NpCellGroupOption, index: number) => {
  const key = getKey(item, index)
  if (props.type === 'radio') {
    if (selectedKeys.value.includes(key)) {
      selectedKeys.value = []
    } else {
      selectedKeys.value = [key]
    }
  } else {
    if (selectedKeys.value.includes(key)) {
      selectedKeys.value = selectedKeys.value.filter(k => k !== key)
    } else {
      selectedKeys.value = [...selectedKeys.value, key]
    }
  }

  emit('change', selectedKeys.value, item)
  emit('update:keys', selectedKeys.value)

  item.onClick?.()
}
</script>
