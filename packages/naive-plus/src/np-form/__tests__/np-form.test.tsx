import { defineComponent, h, nextTick, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { describe, test, expect, vi } from 'vitest'
import { NDynamicTags, NFormItemGi, NGrid, NSelect } from 'naive-ui'
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
    expect((footer.element as HTMLElement).style.justifyContent).toBe('start')
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
    expect((footer.element as HTMLElement).style.justifyContent).toBe('end')

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

  test('renders tag type with NDynamicTags', async () => {
    const option: FormOption<Record<string, any>> = {
      columns: [{ label: '标签', key: 'tags', type: 'tag' }],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()
    expect(wrapper.findComponent(NDynamicTags).exists()).toBe(true)
  })

  test('select onChange receives option in ctx', async () => {
    const onChange = vi.fn()
    const option: FormOption<Record<string, any>> = {
      columns: [
        {
          label: '城市',
          key: 'city',
          type: 'select',
          options: [{ label: '北京', value: 'beijing' }],
          onChange,
        },
      ],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()
    const select = wrapper.findComponent(NSelect)
    const onUpdateValue = select.props('onUpdateValue') as (
      value: string,
      option: Record<string, any>
    ) => void
    onUpdateValue('beijing', { label: '北京', value: 'beijing' })
    await nextTick()

    expect(onChange).toHaveBeenCalledTimes(1)
    const ctx = onChange.mock.calls[0][1]
    expect(ctx.option).toEqual({ label: '北京', value: 'beijing' })
    expect(ctx.data).toBeDefined()
    expect(typeof ctx.setData).toBe('function')
  })

  test('grid renders grid items with span', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 24, xGap: 16 },
      footer: false,
      columns: [
        { label: '姓名', key: 'fullName' },
        { label: '电话', key: 'tel', formItemProps: { span: 12, offset: 1 } },
      ],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const grid = wrapper.find('.n-grid')
    expect(grid.exists()).toBe(true)
    expect((grid.element as HTMLElement).style.gridTemplateColumns).toContain(
      'repeat(24'
    )

    const items = wrapper.findAll('.n-form-item')
    expect(items.length).toBe(2)
    // 未指定 span 时默认占满整行
    expect(
      (items[0].element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 24')
    // 指定 span / offset 时由 n-grid 计算布局
    const secondGridItem = items[1].element.parentElement as HTMLElement
    expect(secondGridItem.style.gridColumn).toContain('span 13')
    // 断言透传给 n-grid 的公开 span / offset 属性
    const gridItems = wrapper.findAllComponents(NFormItemGi)
    expect(gridItems[1].props('span')).toBe(12)
    expect(gridItems[1].props('offset')).toBe(1)
  })

  test('grid footer spans the whole row by default', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 24 },
      columns: [{ label: '姓名', key: 'fullName' }],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const items = wrapper.findAll('.n-form-item')
    const footerItem = items[items.length - 1]
    expect(
      (footerItem.element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 24')
    expect(wrapper.find('.np-form__footer').exists()).toBe(true)
  })

  test('grid footer ignores undefined span in formItemProps', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 24 },
      footer: { formItemProps: { span: undefined } },
      columns: [{ label: '姓名', key: 'fullName' }],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const items = wrapper.findAll('.n-form-item')
    const footerItem = items[items.length - 1]
    expect(
      (footerItem.element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 24')
  })

  test('grid wraps custom render column with grid item', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 2 },
      footer: false,
      columns: [
        { render: () => h('span', { class: 'custom-render' }, 'custom') },
      ],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const custom = wrapper.find('.custom-render')
    expect(custom.exists()).toBe(true)
    expect(
      (custom.element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 2')
  })

  test('grid hides column without leaving empty cell', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 2 },
      footer: false,
      columns: [
        { label: '姓名', key: 'fullName' },
        { label: '电话', key: 'tel', display: false },
      ],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await flushPromises()
    await nextTick()

    expect(wrapper.findAll('.n-form-item').length).toBe(1)
    // 隐藏项不产生元素节点（仅保留注释占位），也不会留下空的栅格单元
    expect(
      (wrapper.find('.n-grid').element as HTMLElement).children.length
    ).toBe(1)
  })

  test('grid form item still works with rules validation', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 24 },
      columns: [
        {
          label: '姓名',
          key: 'fullName',
          rule: { required: true, message: '请输入姓名' },
        },
      ],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await flushPromises()
    await nextTick()

    const submitButton = wrapper
      .findAll('button')
      .find(button => button.text() === '提交')
    await submitButton?.trigger('click')
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.n-form-item-feedback').text()).toContain('请输入姓名')
  })

  test('renders grid layout by default', async () => {
    const option: FormOption<Record<string, any>> = {
      columns: [{ label: '姓名', key: 'fullName' }],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const grid = wrapper.find('.n-grid')
    expect(grid.exists()).toBe(true)
    expect((grid.element as HTMLElement).style.gridTemplateColumns).toContain(
      'repeat(24'
    )
    // 未配置 grid 时默认 24 列，表单项占满整行
    const item = wrapper.find('.n-form-item')
    expect(
      (item.element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 24')
  })

  test('formItemProps.span works without grid config', async () => {
    const option: FormOption<Record<string, any>> = {
      footer: false,
      columns: [
        { label: '姓名', key: 'fullName', formItemProps: { span: 12 } },
        { label: '电话', key: 'tel', formItemProps: { span: 12 } },
      ],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    const items = wrapper.findAll('.n-form-item')
    expect(
      (items[0].element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 12')
    expect(
      (items[1].element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 12')
  })

  test('itemResponsive is enabled by default', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 24 },
      footer: false,
      columns: [
        {
          label: '姓名',
          key: 'fullName',
          formItemProps: { span: '24 400:12' },
        },
      ],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    expect(wrapper.findComponent(NGrid).props('itemResponsive')).toBe(true)
    // 响应式 span 无需额外配置即可生效（窄容器降级为默认值）
    const item = wrapper.find('.n-form-item')
    expect(
      (item.element.parentElement as HTMLElement).style.gridColumn
    ).toContain('span 24')
  })

  test('itemResponsive can be disabled explicitly', async () => {
    const option: FormOption<Record<string, any>> = {
      grid: { cols: 24, itemResponsive: false },
      footer: false,
      columns: [{ label: '姓名', key: 'fullName' }],
    }
    const wrapper = mount(NpForm, { props: { option } })
    await nextTick()

    expect(wrapper.findComponent(NGrid).props('itemResponsive')).toBe(false)
  })
})
