import { afterEach, describe, expect, test, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { NConfigProvider, NDataTable, NMessageProvider } from 'naive-ui'
import NpTable from '../src/np-table'
import type {
  NpTableInst,
  TableApiFetchResult,
  TableOption,
} from '../src/interface'

const mountTable = (option: TableOption) => {
  const tableRef = ref<NpTableInst>()
  const wrapper = mount(
    defineComponent({
      setup() {
        return () => (
          <NConfigProvider>
            <NMessageProvider>
              <NpTable ref={tableRef} option={option} />
            </NMessageProvider>
          </NConfigProvider>
        )
      },
    })
  )
  return { wrapper, tableRef }
}

const createPendingOption = () => {
  const resolvers: Array<(value: TableApiFetchResult) => void> = []
  const fetch = vi.fn(
    () =>
      new Promise<TableApiFetchResult>(resolve => {
        resolvers.push(resolve)
      })
  )
  const option: TableOption = {
    columns: [{ key: 'name', label: '姓名' }],
    api: { fetch },
  }
  return { option, fetch, resolvers }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('np-table loading', () => {
  test('首次加载延迟期内不渲染空状态，避免「暂无数据」闪烁', async () => {
    vi.useFakeTimers()
    const { option, resolvers } = createPendingOption()
    const { wrapper } = mountTable(option)
    await nextTick()

    // 延迟期内既不展示 loading，也不展示空状态，仅展示空白占位
    expect(wrapper.findComponent(NDataTable).props('loading')).toBe(false)
    expect(wrapper.find('.np-table__empty-placeholder').exists()).toBe(true)
    expect(wrapper.find('.n-empty').exists()).toBe(false)

    // 超过延迟时间仍无响应时才展示 loading
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.findComponent(NDataTable).props('loading')).toBe(true)

    resolvers[0]({ items: [{ id: 1 }], itemCount: 1 })
    await vi.advanceTimersByTimeAsync(0)

    const table = wrapper.findComponent(NDataTable)
    expect(table.props('loading')).toBe(false)
    expect(table.props('data')).toEqual([{ id: 1 }])
    expect(wrapper.find('.np-table__empty-placeholder').exists()).toBe(false)

    wrapper.unmount()
  })

  test('首次请求完成且确实无数据时展示默认空状态', async () => {
    vi.useFakeTimers()
    const { option, resolvers } = createPendingOption()
    const { wrapper } = mountTable(option)
    await nextTick()

    resolvers[0]({ items: [], itemCount: 0 })
    await vi.advanceTimersByTimeAsync(0)

    expect(wrapper.find('.np-table__empty-placeholder').exists()).toBe(false)
    expect(wrapper.find('.n-empty').exists()).toBe(true)

    wrapper.unmount()
  })

  test('首次加载完成后，快速请求延迟展示 loading 避免闪烁', async () => {
    vi.useFakeTimers()
    const { option, resolvers } = createPendingOption()
    const { wrapper, tableRef } = mountTable(option)
    await nextTick()

    resolvers[0]({ items: [], itemCount: 0 })
    await vi.advanceTimersByTimeAsync(0)
    expect(wrapper.findComponent(NDataTable).props('loading')).toBe(false)

    tableRef.value!.refresh()
    await nextTick()
    // 延迟未到前不展示 loading
    expect(wrapper.findComponent(NDataTable).props('loading')).toBe(false)

    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.findComponent(NDataTable).props('loading')).toBe(true)

    resolvers[1]({ items: [], itemCount: 0 })
    await vi.advanceTimersByTimeAsync(0)
    expect(wrapper.findComponent(NDataTable).props('loading')).toBe(false)

    wrapper.unmount()
  })
})
