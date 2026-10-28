<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    type="warning"
    :title="locale.Table.deleteDialog.title"
    :content="locale.Table.deleteDialog.content"
    :positive-text="locale.Table.deleteDialog.confirmText"
    :negative-text="locale.Table.deleteDialog.cancelText"
    :auto-focus="false"
    :positive-button-props="{ type: 'error', loading }"
    @positive-click="handleConfirm"
    @negative-click="handleCancel"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal } from 'naive-ui'
import { useLocale } from '../../../_hooks/config'
import type { AnyObject } from '../../../types'

const props = defineProps<{
  visible: boolean
  loading: boolean
  row: AnyObject
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [row: AnyObject]
}>()

/** np-config-provider 注入的文案 */
const locale = useLocale()

const visible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

const handleConfirm = () => {
  emit('confirm', props.row)
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>
