import { defineComponent, ref, watch } from 'vue'
import { useCreate } from '../../_hooks/create'
import { useConfigProps } from '../../_hooks/config'
import {
  npCheckboxDefaults,
  npCheckboxProps,
  type CheckboxGroupValue,
  type CheckboxOption,
} from './props'
import { arrayTransferByKeys, computedAsync, runAsync } from '../../utils'
import { NCheckbox, NCheckboxGroup, NSpin } from 'naive-ui'

const { name, bemClass } = useCreate('np-checkbox')

export default defineComponent({
  name,
  props: npCheckboxProps,
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // prop > np-config-provider > 内置默认值
    const merged = useConfigProps('Checkbox', props, npCheckboxDefaults, [
      'props',
    ])

    const data = ref<CheckboxGroupValue>(props.modelValue || [])
    watch(
      () => props.modelValue,
      val => {
        data.value = val ?? []
      },
      {
        deep: true,
      }
    )

    const handleChange = (value: CheckboxGroupValue) => {
      data.value = value
      emit('update:modelValue', value)
      // 改变事件属于使用时的业务逻辑，只取组件自身的 props
      props.onChange?.(value)
    }

    const loading = ref(false)
    const options = computedAsync<CheckboxOption[]>(
      async () => {
        const timer = setTimeout(() => {
          loading.value = true
        }, merged.value.loadingDelay)
        try {
          const res = await runAsync(props.options)
          return arrayTransferByKeys(res, {
            label: props.labelField,
            value: props.valueField,
          })
        } catch {
          return []
        } finally {
          clearTimeout(timer)
          loading.value = false
        }
      },
      [],
      { resetInitialStateEffect: true }
    )

    return () => (
      <div class={bemClass.value} style={{ minHeight: '25.6px' }}>
        <NCheckboxGroup
          {...merged.value.props}
          value={data.value}
          onUpdateValue={handleChange}
        >
          {loading.value && options.value.length === 0 ? (
            <div style={{ width: 'fit-content' }}>
              <NSpin size={14}>
                <NCheckbox disabled></NCheckbox>
              </NSpin>
            </div>
          ) : (
            options.value.map(item => (
              <NCheckbox value={item.value} label={item.label}></NCheckbox>
            ))
          )}
        </NCheckboxGroup>
      </div>
    )
  },
})
