import { describe, expect, test, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { NConfigProvider, NDataTable, NMessageProvider } from 'naive-ui'
import NpTable from '../src/np-table'
import IconButtonGroup from '../src/np-table-header/icon-button-group.vue'
import type { TableOption } from '../src/interface'

const createOption = (): TableOption => ({
  columns: [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C' },
  ],
  operation: false,
  api: { fetch: vi.fn(async () => ({ items: [], itemCount: 0 })) },
})

const mountTable = (option: TableOption) =>
  mount(
    defineComponent({
      setup() {
        return () => (
          <NConfigProvider>
            <NMessageProvider>
              <NpTable option={option} />
            </NMessageProvider>
          </NConfigProvider>
        )
      },
    })
  )

const visibleKeys = (wrapper: ReturnType<typeof mountTable>) =>
  (
    wrapper.findComponent(NDataTable).props('columns') as Array<{ key: string }>
  ).map(column => column.key)

const displayOptions = (wrapper: ReturnType<typeof mountTable>) =>
  (
    wrapper.findComponent(IconButtonGroup).vm as unknown as {
      displayOptions: Array<{ key: string; onClick: () => void }>
    }
  ).displayOptions

describe('np-table column display', () => {
  test('连续隐藏多列互不影响，隐藏列仍保留在显示设置中', async () => {
    const wrapper = mountTable(createOption())
    await nextTick()
    await flushPromises()

    const hide = async (key: string) => {
      displayOptions(wrapper)
        .find(item => item.key === key)!
        .onClick()
      await nextTick()
    }

    expect(visibleKeys(wrapper)).toEqual(['a', 'b', 'c'])

    await hide('b')
    expect(visibleKeys(wrapper)).toEqual(['a', 'c'])

    await hide('c')
    // 先前隐藏的 b 不应复活
    expect(visibleKeys(wrapper)).toEqual(['a'])

    // 隐藏的列仍保留在「显示设置」中，便于重新开启
    expect(displayOptions(wrapper).map(item => item.key)).toEqual([
      'a',
      'b',
      'c',
    ])

    wrapper.unmount()
  })
})
