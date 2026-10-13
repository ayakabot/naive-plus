import { describe, expect, test, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import NpTable from '../src/np-table'
import type { NpTableInst, TableOption } from '../src/interface'

const createOption = () => {
  const fetch = vi.fn(async () => ({ items: [], itemCount: 0 }))
  const option: TableOption = {
    columns: [{ key: 'name', label: '姓名' }],
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

describe('np-table expose', () => {
  test('refresh 重新请求当前页数据', async () => {
    const { option, fetch } = createOption()
    const { wrapper, tableRef } = mountTable(option)
    await nextTick()
    await flushPromises()
    expect(fetch).toHaveBeenCalledTimes(1)

    await tableRef.value!.refresh()
    expect(fetch).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  test('reload 重置到第一页并重新请求', async () => {
    const { option, fetch } = createOption()
    const { wrapper, tableRef } = mountTable(option)
    await nextTick()
    await flushPromises()

    await tableRef.value!.reload()
    expect(fetch).toHaveBeenLastCalledWith(
      { page: 1, pageSize: 10 },
      expect.anything()
    )

    wrapper.unmount()
  })

  test('params 会传递给 api.fetch', async () => {
    const { option, fetch } = createOption()
    const { wrapper, tableRef } = mountTable(option)
    await nextTick()
    await flushPromises()

    tableRef.value!.params = { keyword: 'abc' }
    await tableRef.value!.reload()

    expect(fetch).toHaveBeenLastCalledWith(
      { page: 1, pageSize: 10 },
      { keyword: 'abc' }
    )

    wrapper.unmount()
  })

  test('pagination.defaultPage 首次请求使用指定页', async () => {
    const { option, fetch } = createOption()
    option.pagination = { defaultPage: 3 }
    const { wrapper } = mountTable(option)
    await nextTick()
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(
      { page: 3, pageSize: 10 },
      expect.anything()
    )

    wrapper.unmount()
  })
})
