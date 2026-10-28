<template>
  <div
    :class="`${bemClass} ${bemClass}__${merged.size} ${
      isHover ? `${bemClass}__hover` : ''
    }`"
    @click="handleClick"
  >
    <div
      :class="`${bemClass}__content ${
        merged.bordered ? `${bemClass}__content-border` : ''
      }`"
    >
      <div v-if="merged.type || merged.icon" :class="`${bemClass}__control`">
        <NCheckbox
          v-if="merged.type === 'checkbox'"
          :size="typeSize"
          :checked="merged.checked"
        />
        <NRadio
          v-else-if="merged.type === 'radio'"
          :size="typeSize"
          :checked="merged.checked"
        />
        <NSwitch
          v-else-if="merged.type === 'switch'"
          :size="typeSize"
          :value="merged.checked"
        />

        <div v-if="merged.icon" :class="`${bemClass}__icon`">
          <RenderContent :is="merged.icon" />
        </div>
      </div>
      <div :class="`${bemClass}__wrapper`">
        <div :class="`${bemClass}__left`">
          <div :class="`${bemClass}__label`">
            <RenderContent :is="merged.label" />
          </div>
          <div v-if="merged.description" :class="`${bemClass}__description`">
            <RenderContent :is="merged.description" />
          </div>
        </div>
        <div :class="`${bemClass}__right`">
          <div v-if="merged.value" :class="`${bemClass}__value`">
            <RenderContent :is="merged.value" />
          </div>
          <NIcon v-if="merged.arrow" :class="`${bemClass}__arrow`">
            <ArrowRightIcon />
          </NIcon>
        </div>
      </div>
      <div v-if="$slots.footer || merged.footer" :class="`${bemClass}__footer`">
        <slot name="footer">
          <RenderContent :is="merged.footer" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCheckbox, NRadio, NSwitch, NIcon } from 'naive-ui'
import { useCreate } from '../../_hooks/create'
import { useConfigProps } from '../../_hooks/config'
import { npCellDefaults, npCellProps } from './props'
import ArrowRightIcon from './arrow-right.vue'
import { computed } from 'vue'
import RenderContent from '../../_components/render-content/render-content'

const { bemClass } = useCreate('np-cell')

const props = defineProps(npCellProps)

const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()

// prop > np-config-provider > 内置默认值
const merged = useConfigProps('Cell', props, npCellDefaults)

const typeSize = computed(() => {
  if (merged.value.size === 'large') {
    return 'medium'
  }
  return 'small'
})

const isHover = computed(
  () => merged.value.hover ?? merged.value.type !== undefined
)

const handleClick = () => {
  if (merged.value.type) {
    emit('update:checked', !merged.value.checked)
  }
}
</script>
