import { defineComponent, ref, watch } from 'vue'
import { useCreate } from '../../_hooks/create'
import { useConfigProps } from '../../_hooks/config'
import {
  npRadioDefaults,
  npRadioProps,
  type RadioGroupValue,
  type RadioOption,
} from './props'
import { arrayTransferByKeys, computedAsync, runAsync } from '../../utils'
import { NRadio, NRadioButton, NRadioGroup, NSpin } from 'naive-ui'

const { name, bemClass } = useCreate('np-radio')

export default defineComponent({
  name,
  props: npRadioProps,
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // prop > np-config-provider > 内置默认值
    const merged = useConfigProps('Radio', props, npRadioDefaults, ['props'])

    const data = ref<RadioGroupValue>(props.modelValue)
    watch(
      () => props.modelValue,
      val => {
        data.value = val
      }
    )

    const handleChange = (value: RadioGroupValue) => {
      data.value = value
      emit('update:modelValue', value)
      // 改变事件属于使用时的业务逻辑，只取组件自身的 props
      props.onChange?.(value)
    }

    const loading = ref(false)
    const options = computedAsync<RadioOption[]>(
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
    return () => {
      // 在渲染函数中读取，保证 np-config-provider 变化时能切换控件类型
      const RadioItem = merged.value.type === 'button' ? NRadioButton : NRadio

      return (
        <div class={bemClass.value}>
          <NRadioGroup
            {...merged.value.props}
            value={data.value}
            onUpdateValue={handleChange}
          >
            {loading.value && options.value.length === 0 ? (
              <NSpin size={16}>
                <RadioItem></RadioItem>
              </NSpin>
            ) : (
              options.value.map(item => (
                <RadioItem
                  value={item.value}
                  disabled={(item as any).disabled === true}
                >
                  {item.label}
                </RadioItem>
              ))
            )}
          </NRadioGroup>
        </div>
      )
    }
  },
})
