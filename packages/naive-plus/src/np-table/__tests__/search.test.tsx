import { afterEach, describe, expect, test, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { NConfigProvider, NDataTable, NInput, NMessageProvider } from 'naive-ui'
import NpTable from '../src/np-table'
import type {
  NpTableInst,
  TableApiFetchResult,
  TableOption,
} from '../src/interface'

const createOption = (search?: TableOption['search']) => {
  const fetch = vi.fn(async () => ({ items: [], itemCount: 0 }))
  const option: TableOption = {
    columns: [{ key: 'name', label: '姓名' }],
    search,
    api: { fetch },
  }
  return { option, fetch }
}

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

/**
 * 挂载并等待首次请求完成，避免 loading 阻断后续搜索请求
 */
const mountAndSettle = async (option: TableOption) => {
  const result = mountTable(option)
  await nextTick()
  await vi.advanceTimersByTimeAsync(0)
  return result
}

const searchInput = (wrapper: ReturnType<typeof mountTable>['wrapper']) =>
  wrapper.find('.np-table__search input')

/**
 * 挂载并触发一次搜索，使首次请求与搜索请求同时处于进行中
 */
const mountWithTwoPendingRequests = async () => {
  const resolvers: Array<(value: TableApiFetchResult) => void> = []
  const fetch = vi.fn(
    () =>
      new Promise<TableApiFetchResult>(resolve => {
        resolvers.push(resolve)
      })
  )
  const option: TableOption = {
    columns: [{ key: 'name', label: '姓名' }],
    search: {},
    api: { fetch },
  }
  const { wrapper } = mountTable(option)
  await nextTick()

  const input = searchInput(wrapper)
  await input.setValue('abc')
  await vi.advanceTimersByTimeAsync(300)

  return { wrapper, fetch, resolvers }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('np-table search', () => {
  test('未配置 search 时不渲染搜索框', async () => {
    const { option } = createOption()
    const { wrapper } = mountTable(option)
    await nextTick()
    await flushPromises()

    expect(wrapper.find('.np-table__search').exists()).toBe(false)

    wrapper.unmount()
  })

  test('输入防抖后自动触发搜索并重置到第一页', async () => {
    vi.useFakeTimers()
    const { option, fetch } = createOption({})
    option.pagination = { defaultPage: 3 }
    const { wrapper } = await mountAndSettle(option)

    const input = searchInput(wrapper)
    expect(input.exists()).toBe(true)

    await input.setValue('abc')
    // 防抖未结束前不触发
    expect(fetch).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(300)
    expect(fetch).toHaveBeenLastCalledWith(
      { page: 1, pageSize: 10 },
      { keyword: 'abc' }
    )

    wrapper.unmount()
  })

  test('自定义 key 作为搜索参数名', async () => {
    vi.useFakeTimers()
    const { option, fetch } = createOption({ key: 'name' })
    const { wrapper } = await mountAndSettle(option)

    const input = searchInput(wrapper)
    await input.setValue('abc')
    await vi.advanceTimersByTimeAsync(300)

    expect(fetch).toHaveBeenLastCalledWith(
      { page: 1, pageSize: 10 },
      { name: 'abc' }
    )

    wrapper.unmount()
  })

  test('搜索参数与 params 合并', async () => {
    vi.useFakeTimers()
    const { option, fetch } = createOption({})
    const { wrapper, tableRef } = await mountAndSettle(option)

    tableRef.value!.params = { type: 'a' }
    const input = searchInput(wrapper)
    await input.setValue('abc')
    await vi.advanceTimersByTimeAsync(300)

    expect(fetch).toHaveBeenLastCalledWith(
      { page: 1, pageSize: 10 },
      { keyword: 'abc', type: 'a' }
    )

    wrapper.unmount()
  })

  test('清空输入框移除搜索参数', async () => {
    vi.useFakeTimers()
    const { option, fetch } = createOption({})
    const { wrapper } = await mountAndSettle(option)

    const input = searchInput(wrapper)
    await input.setValue('abc')
    await vi.advanceTimersByTimeAsync(300)

    wrapper.findComponent(NInput).vm.$emit('clear')
    await vi.advanceTimersByTimeAsync(0)

    expect(fetch).toHaveBeenLastCalledWith({ page: 1, pageSize: 10 }, {})

    wrapper.unmount()
  })

  test('连续输入只触发一次搜索', async () => {
    vi.useFakeTimers()
    const { option, fetch } = createOption({ debounce: 300 })
    const { wrapper } = await mountAndSettle(option)

    const input = searchInput(wrapper)
    await input.setValue('a')
    await input.setValue('ab')
    await input.setValue('abc')
    // 防抖期间不触发，仅保留首次请求
    expect(fetch).toHaveBeenCalledTimes(1)

    // 停止输入后以最新值触发一次
    await vi.advanceTimersByTimeAsync(300)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(
      { page: 1, pageSize: 10 },
      { keyword: 'abc' }
    )

    wrapper.unmount()
  })

  test('并发请求时丢弃过期响应，避免旧数据覆盖', async () => {
    vi.useFakeTimers()
    const { wrapper, fetch, resolvers } = await mountWithTwoPendingRequests()

    // 首次请求未结束，搜索直接发起第二个请求
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(
      { page: 1, pageSize: 10 },
      { keyword: 'abc' }
    )

    const table = () => wrapper.findComponent(NDataTable)

    // 新请求先返回：写入数据，并立即关闭 loading（不被旧请求拖住）
    resolvers[1]({ items: [{ id: 'new' }], itemCount: 1 })
    await vi.advanceTimersByTimeAsync(0)
    expect(table().props('data')).toEqual([{ id: 'new' }])
    expect(table().props('loading')).toBe(false)

    // 旧请求后返回：响应被丢弃，不得覆盖新数据
    resolvers[0]({ items: [{ id: 'old' }], itemCount: 1 })
    await vi.advanceTimersByTimeAsync(0)
    expect(table().props('data')).toEqual([{ id: 'new' }])
    expect(table().props('loading')).toBe(false)

    wrapper.unmount()
  })

  test('过期请求结束不提前关闭 loading', async () => {
    vi.useFakeTimers()
    const { wrapper, resolvers } = await mountWithTwoPendingRequests()

    const table = () => wrapper.findComponent(NDataTable)
    expect(table().props('loading')).toBe(true)

    // 旧请求先返回：响应被丢弃，且不能提前关闭 loading
    resolvers[0]({ items: [{ id: 'old' }], itemCount: 1 })
    await vi.advanceTimersByTimeAsync(0)
    expect(table().props('data')).toEqual([])
    expect(table().props('loading')).toBe(true)

    // 新请求返回后才关闭
    resolvers[1]({ items: [{ id: 'new' }], itemCount: 1 })
    await vi.advanceTimersByTimeAsync(0)
    expect(table().props('data')).toEqual([{ id: 'new' }])
    expect(table().props('loading')).toBe(false)

    wrapper.unmount()
  })
})
