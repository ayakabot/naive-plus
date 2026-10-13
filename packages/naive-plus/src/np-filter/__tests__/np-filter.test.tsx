import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, test, expect, vi } from 'vitest'
import NpFilter from '../src/np-filter.vue'

// naive-ui 组件在 SFC 中为局部导入，global.stubs 无法替换，
// 这里通过模块 mock 让 popover / scrollbar 渲染默认插槽，便于测试内部筛选项。
vi.mock('naive-ui', async () => {
  const actual = await vi.importActual<any>('naive-ui')
  const { h } = await import('vue')
  // popover / scrollbar 需要渲染插槽，才能测试到内部的筛选项
  const slotStub = (_props: any, { slots }: any) =>
    h('div', [slots.trigger?.(), slots.default?.()])
  const plainStub = () => h('div')

  return {
    ...actual,
    NPopover: slotStub,
    NScrollbar: slotStub,
    NCheckbox: plainStub,
    NRadio: plainStub,
    NSwitch: plainStub,
    NIcon: plainStub,
    NDivider: plainStub,
    NEmpty: plainStub,
    NInput: plainStub,
    NSpin: plainStub,
  }
})

const TestWrapper = defineComponent({
  components: { NpFilter },
  props: ['items', 'onChange'],
  setup() {
    const params = ref<Record<string, any>>({})
    return { params }
  },
  template: `
    <NpFilter
      v-model:params="params"
      :items="items"
      @change="onChange"
    >
      <button>Filter</button>
    </NpFilter>
  `,
})

const mountFilter = (items: any[]) => {
  const onChange = vi.fn()
  const wrapper = mount(TestWrapper, {
    props: { items, onChange },
  })
  return { wrapper, onChange }
}

// 等待异步选项解析 + 视图更新
const ready = async () => {
  await flushPromises()
  await nextTick()
}

// 等待 throttle(150ms) 的 trailing 调用
const waitThrottle = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  await ready()
}

const getParams = (wrapper: ReturnType<typeof mount>) =>
  (wrapper.vm as unknown as { params: Record<string, any> }).params

const findOptionCells = (wrapper: ReturnType<typeof mount>) => {
  const group = wrapper.findComponent({ name: 'NpCellGroup' })
  return group.findAllComponents({ name: 'NpCell' })
}

const booleanItems = (multiple: boolean) => [
  {
    label: '状态',
    key: 'enabled',
    multiple,
    options: [
      { label: '启用', value: true },
      { label: '禁用', value: false },
    ],
  },
]

describe('NpFilter', () => {
  test('renders correctly', async () => {
    const items = [
      {
        label: '状态',
        key: 'status',
        options: [
          { label: '进行中', value: 'ongoing' },
          { label: '已完成', value: 'done' },
        ],
      },
    ]

    const { wrapper } = mountFilter(items)

    expect(wrapper.find('button').exists()).toBe(true)
  })

  test('renders grouped options correctly', async () => {
    const items = [
      {
        label: '优先级',
        key: 'priority',
        searchable: true,
        multiple: false,
        options: [
          { title: '紧急', options: [{ label: '高', value: 'high' }] },
          {
            title: '普通',
            options: [
              { label: '中', value: 'medium' },
              { label: '低', value: 'low' },
            ],
          },
        ],
      },
    ]

    const { wrapper } = mountFilter(items)
    await ready()

    // 分组标题会被渲染
    expect(wrapper.text()).toContain('紧急')
    expect(wrapper.text()).toContain('普通')
  })

  test('boolean 单选：false 会被写入 params 而不是被清除', async () => {
    const { wrapper, onChange } = mountFilter(booleanItems(false))
    await ready()

    const cells = findOptionCells(wrapper)
    expect(cells.length).toBe(2)

    await cells[1].trigger('click')
    await ready()

    expect(getParams(wrapper)).toEqual({ enabled: false })
    expect(onChange).toHaveBeenCalledWith({ enabled: false })
  })

  test('boolean 单选：再次点击会清除对应 key', async () => {
    const { wrapper } = mountFilter(booleanItems(false))
    await ready()

    const cells = findOptionCells(wrapper)
    await cells[1].trigger('click')
    await waitThrottle()
    expect(getParams(wrapper)).toEqual({ enabled: false })

    await cells[1].trigger('click')
    await waitThrottle()
    expect(getParams(wrapper)).toEqual({})
  })

  test('boolean 多选：true/false 以数组形式保存', async () => {
    const { wrapper } = mountFilter(booleanItems(true))
    await ready()

    const cells = findOptionCells(wrapper)
    await cells[0].trigger('click')
    await waitThrottle()
    expect(getParams(wrapper)).toEqual({ enabled: [true] })

    await cells[1].trigger('click')
    await waitThrottle()
    expect(getParams(wrapper)).toEqual({ enabled: [true, false] })

    await cells[0].trigger('click')
    await waitThrottle()
    expect(getParams(wrapper)).toEqual({ enabled: [false] })
  })

  test('boolean 值会展示清除入口', async () => {
    const { wrapper } = mountFilter(booleanItems(false))
    await ready()

    expect(wrapper.text()).not.toContain('清除所有筛选')

    await findOptionCells(wrapper)[1].trigger('click')
    await ready()

    expect(wrapper.text()).toContain('清除所有筛选')
  })
})
