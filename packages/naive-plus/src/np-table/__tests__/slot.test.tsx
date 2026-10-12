import { describe, expect, test } from 'vitest'
import { defineComponent, nextTick, type PropType } from 'vue'
import { mount } from '@vue/test-utils'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import NpTable from '../src/np-table'
import type { TableOption } from '../src/interface'

const option: TableOption = {
  columns: [{ key: 'name', label: '姓名' }],
  pagination: false,
  api: {
    fetch: async () => ({ items: [] }),
  },
}

const Host = defineComponent({
  props: {
    option: {
      type: Object as PropType<TableOption>,
      required: true,
    },
    slotPrefix: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return () => (
      <NConfigProvider>
        <NMessageProvider>
          <NpTable option={props.option}>
            {{
              headerLeft: () => <span>{`${props.slotPrefix}TOP-LEFT`}</span>,
              headerRight: () => <span>{`${props.slotPrefix}TOP-RIGHT`}</span>,
              footerLeft: () => <span>{`${props.slotPrefix}BOTTOM-LEFT`}</span>,
            }}
          </NpTable>
        </NMessageProvider>
      </NConfigProvider>
    )
  },
})

describe('np-table slots', () => {
  test('renders headerLeft / headerRight / footerLeft', async () => {
    const wrapper = mount(Host, { props: { option, slotPrefix: '' } })
    await nextTick()

    const html = wrapper.html()
    expect(html).toContain('>TOP-LEFT<')
    expect(html).toContain('>TOP-RIGHT<')
    expect(html).toContain('>BOTTOM-LEFT<')
    expect(html).toContain('np-table__footer-left')

    wrapper.unmount()
  })

  test('option.slots takes precedence over component slots', async () => {
    const wrapper = mount(Host, {
      props: {
        option: {
          ...option,
          slots: {
            headerLeft: () => <span>OPTION-TOP-LEFT</span>,
            headerRight: () => <span>OPTION-TOP-RIGHT</span>,
            footerLeft: () => <span>OPTION-BOTTOM-LEFT</span>,
          },
        },
        slotPrefix: 'SLOT-',
      },
    })
    await nextTick()

    const html = wrapper.html()
    expect(html).toContain('OPTION-TOP-LEFT')
    expect(html).toContain('OPTION-TOP-RIGHT')
    expect(html).toContain('OPTION-BOTTOM-LEFT')
    expect(html).not.toContain('SLOT-TOP-LEFT')
    expect(html).not.toContain('SLOT-TOP-RIGHT')
    expect(html).not.toContain('SLOT-BOTTOM-LEFT')

    wrapper.unmount()
  })
})
