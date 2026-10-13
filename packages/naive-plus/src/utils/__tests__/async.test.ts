import { describe, test, expect, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { computedAsync } from '../async'

const flush = async () => {
  for (let i = 0; i < 5; i++) await nextTick()
}

describe('computedAsync', () => {
  test('非 lazy 默认行为：立即求值并响应依赖变化', async () => {
    const source = ref(1)
    const fn = vi.fn(() => source.value * 2)
    const c = computedAsync(fn, 0)
    await flush()
    expect(c.value).toBe(2)
    source.value = 5
    await flush()
    expect(c.value).toBe(10)
  })

  test('lazy: true 在调用 evaluate 前不执行计算函数', async () => {
    const fn = vi.fn(() => 1)
    const c = computedAsync(fn, 0, { lazy: true })
    await flush()
    expect(fn).not.toHaveBeenCalled()
    expect(c.value).toBe(0)
  })

  test('lazy: true 调用 evaluate 后求值并继续响应依赖变化', async () => {
    const source = ref(1)
    const fn = vi.fn(() => source.value * 2)
    const c = computedAsync(fn, 0, { lazy: true })
    await flush()
    c.evaluate()
    await flush()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(c.value).toBe(2)
    source.value = 5
    await flush()
    expect(c.value).toBe(10)
  })
})
