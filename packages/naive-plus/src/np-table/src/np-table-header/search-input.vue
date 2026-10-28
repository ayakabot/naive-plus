<template>
  <NInput
    v-model:value="value"
    v-bind="option.props"
    :class="bemClass"
    :style="{ width: inputWidth }"
    :placeholder="placeholder"
    :clearable="clearable"
    @clear="handleClear"
    @update:value="handleUpdateValue"
  >
    <template #prefix>
      <NIcon :class="`${bemClass}-icon`">
        <SearchIcon />
      </NIcon>
    </template>
  </NInput>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { debounce } from 'lodash-es'
import { NIcon, NInput } from 'naive-ui'
import type { TableSearchOption } from '../interface'
import SearchIcon from '../icon/search.vue'
import { useLocale } from '../../../_hooks/config'

const props = defineProps<{
  option: TableSearchOption
  onChange: (value?: string) => void
}>()

const bemClass = 'np-table__search'

const locale = useLocale()

const value = ref('')
/**
 * 上一次提交的值，避免清空等场景重复触发搜索
 */
const emittedValue = ref('')

const placeholder = computed(
  () => props.option.placeholder ?? locale.value.Table.search.placeholder
)
const clearable = computed(() => props.option.clearable ?? true)
const inputWidth = computed(() => {
  const width = props.option.width ?? 220
  return typeof width === 'number' ? `${width}px` : width
})

const emitChange = (val: string) => {
  const trimed = val.trim()
  if (trimed === emittedValue.value) {
    return
  }
  emittedValue.value = trimed
  props.onChange(trimed || undefined)
}

const debouncedChange = debounce(
  (val: string) => emitChange(val),
  props.option.debounce ?? 300
)

const handleUpdateValue = (val: string) => {
  debouncedChange(val)
}

const handleClear = () => {
  value.value = ''
  debouncedChange.cancel()
  emitChange('')
}

onUnmounted(() => debouncedChange.cancel())
</script>
