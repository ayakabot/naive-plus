import { defineComponent, h, nextTick, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'
import { NpForm } from '../index'
import type { FormOption } from '../src/interface'

describe('NpForm', () => {
  test('render', async () => {
    const wrapper = mount(NpForm, {
      props: {
        option: {
          columns: [],
        },
      },
    })
    await nextTick()
    expect(wrapper.html()).include('np-form')
  })

  test('reset clears input display after model data resets', async () => {
    const option: FormOption<Record<string, any>> = {
      columns: [
        {
          label: '姓名',
          key: 'fullName',
        },
        {
          label: '电话',
          key: 'tel',
          type: 'number',
        },
        {
          label: '年龄最大值',
          key: 'ageMax',
          type: 'number',
          defaultValue: 50,
        },
      ],
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const data = ref<Record<string, any>>()
          return () =>
            h(NpForm, {
              modelValue: data.value,
              'onUpdate:modelValue': value => {
                data.value = value
              },
              option,
            })
        },
      })
    )

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('张三')
    await inputs[1].setValue('13800138000')

    expect((inputs[0].element as HTMLInputElement).value).toBe('张三')
    expect((inputs[1].element as HTMLInputElement).value).toBe('13800138000')

    const resetButton = wrapper
      .findAll('button')
      .find(button => button.text() === '重置')
    await resetButton?.trigger('click')
    await nextTick()

    expect((inputs[0].element as HTMLInputElement).value).toBe('')
    expect((inputs[1].element as HTMLInputElement).value).toBe('')
    expect((inputs[2].element as HTMLInputElement).value).toBe('50')
  })

  test('submit error shows in footer form item feedback', async () => {
    const option: FormOption<Record<string, any>> = {
      columns: [{ label: '姓名', key: 'fullName' }],
      onSubmit: () => {
        throw new Error('提交失败啦')
      },
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const submitButton = wrapper
      .findAll('button')
      .find(button => button.text() === '提交')
    await submitButton?.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.n-form-item-feedback').text()).toContain('提交失败啦')
  })

  test('submit error can be disabled by submitErrorFeedback', async () => {
    const option: FormOption<Record<string, any>> = {
      columns: [{ label: '姓名', key: 'fullName' }],
      footer: { submitErrorFeedback: false },
      onSubmit: () => {
        throw new Error('提交失败啦')
      },
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const submitButton = wrapper
      .findAll('button')
      .find(button => button.text() === '提交')
    await submitButton?.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).not.toContain('提交失败啦')
  })

  test('submit success clears footer feedback', async () => {
    let shouldFail = true
    const option: FormOption<Record<string, any>> = {
      columns: [{ label: '姓名', key: 'fullName' }],
      onSubmit: () => {
        if (shouldFail) {
          throw new Error('提交失败啦')
        }
      },
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const submitButton = wrapper
      .findAll('button')
      .find(button => button.text() === '提交')
    await submitButton?.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.find('.n-form-item-feedback').text()).toContain('提交失败啦')

    shouldFail = false
    // 等待按钮节流（throttleDelay 默认 350ms）结束
    await new Promise(resolve => setTimeout(resolve, 400))
    await submitButton?.trigger('click')
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).not.toContain('提交失败啦')
  })

  test('footer align defaults to left', async () => {
    const option: FormOption<Record<string, any>> = {
      columns: [{ label: '姓名', key: 'fullName' }],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const footer = wrapper.find('.np-form__footer')
    expect((footer.element as HTMLElement).style.justifyContent).toBe(
      'flex-start'
    )
  })

  test('footer align right aligns content and feedback to the end', async () => {
    const option: FormOption<Record<string, any>> = {
      columns: [{ label: '姓名', key: 'fullName' }],
      footer: { align: 'right' },
      onSubmit: () => {
        throw new Error('提交失败啦')
      },
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const footer = wrapper.find('.np-form__footer')
    expect((footer.element as HTMLElement).style.justifyContent).toBe(
      'flex-end'
    )

    const submitButton = wrapper
      .findAll('button')
      .find(button => button.text() === '提交')
    await submitButton?.trigger('click')
    await flushPromises()
    await nextTick()

    const feedbackWrappers = wrapper.findAll('.n-form-item-feedback-wrapper')
    expect(
      feedbackWrappers[feedbackWrappers.length - 1].attributes('style')
    ).toContain('text-align: end')
  })
})
