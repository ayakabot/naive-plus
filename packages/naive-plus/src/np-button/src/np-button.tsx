import { computed, defineComponent, onUnmounted, ref, watch } from 'vue'
import { useCreate } from '../../_hooks/create'
import { useConfigProps } from '../../_hooks/config'
import { npButtonDefaults, npButtonProps } from './props'
import { NButton, NSpin } from 'naive-ui'
import { throttle } from 'lodash-es'
import { runAsync } from '../../utils'

const { name, bemClass } = useCreate('np-button')

export default defineComponent({
  name,
  props: npButtonProps,
  setup(props, { expose, slots }) {
    const loading = ref(false)

    // prop > np-config-provider > 内置默认值
    const merged = useConfigProps('Button', props, npButtonDefaults, [
      'props',
      'style',
    ])

    let timer: ReturnType<typeof setTimeout> | undefined

    const createThrottledClick = (delay: number | undefined) =>
      throttle(
        (e: MouseEvent) => {
          if (timer !== undefined) {
            return
          }
          // 点击行为属于使用时的业务逻辑，只取组件自身的 props，不走 np-config-provider
          if (props.click === undefined) {
            props.onClick?.(e)
            return
          }

          timer = setTimeout(() => {
            loading.value = true
          }, merged.value.loadingDelay)
          runAsync(props.click, e)
            .catch(error => {
              console.error(error)
            })
            .finally(() => {
              clearTimeout(timer)
              timer = undefined
              loading.value = false
            })
        },
        delay ?? npButtonDefaults.throttleDelay ?? 0,
        {
          leading: true,
          trailing: false,
        }
      )

    // throttleDelay 可能在运行期变化（如 np-config-provider 配置更新），需要重建节流函数
    let throttledClick = createThrottledClick(merged.value.throttleDelay)

    watch(
      () => merged.value.throttleDelay,
      delay => {
        throttledClick.cancel()
        throttledClick = createThrottledClick(delay)
      }
    )

    const handleClick = (e: MouseEvent) => throttledClick(e)

    onUnmounted(() => {
      if (timer !== undefined) {
        clearTimeout(timer)
      }
      throttledClick.cancel()
    })

    const buttonRef = ref<InstanceType<typeof NButton>>()

    expose(
      new Proxy(
        {},
        {
          get(_, p) {
            if (p === 'click') {
              return handleClick
            }
            return ((buttonRef.value || {}) as any)[p]
          },
          has(_, p) {
            if (p === 'click') {
              return true
            }
            return p in (buttonRef.value || {})
          },
        }
      )
    )

    const renderContent = () => {
      const slotNodes = Object.keys(slots).map(slotName => slots[slotName]?.())
      if (loading.value || merged.value.props?.loading === true) {
        return (
          <NSpin
            size={14}
            style={
              merged.value.type === 'default'
                ? undefined
                : '--n-color: var(--n-text-color-hover);'
            }
          >
            {slotNodes}
          </NSpin>
        )
      }
      return slotNodes
    }

    const isSecondary = computed(() => {
      return (
        merged.value.type === 'default' &&
        merged.value.props?.ghost !== true &&
        merged.value.props?.dashed !== true
      )
    })

    const style = computed(() => {
      const _style = {
        '--n-color-focus': 'var(--n-color)',
        '--n-text-color-focus': 'var(--n-text-color)',
        ...merged.value.style,
      }
      if (merged.value.props?.block) {
        _style.flex = 1
      }
      return _style
    })

    return () => (
      <NButton
        ref={buttonRef}
        class={bemClass.value}
        style={style.value}
        type={merged.value.type}
        secondary={isSecondary.value}
        {...merged.value.props}
        disabled={loading.value || merged.value.props?.disabled}
        onClick={handleClick}
      >
        {renderContent()}
      </NButton>
    )
  },
})
