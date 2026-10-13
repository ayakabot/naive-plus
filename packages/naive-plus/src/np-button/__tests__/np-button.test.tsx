import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, test, expect, vi } from 'vitest'
import { NpButton } from '../index'

describe('NpButton', () => {
  test('render', async () => {
    const wrapper = mount(NpButton)
    await nextTick()
    expect(wrapper.html()).include('np-button')
  })

  test('异步 click 拒绝时消费错误，不产生未处理拒绝', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mount(NpButton, {
      props: {
        click: async () => {
          throw new Error('boom')
        },
      },
    })
    await nextTick()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
