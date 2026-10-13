import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { ComponentInfo } from 'unplugin-vue-components/types'
import type { NaivePlusResolverOptions } from '../resolver'

type Resolver = typeof import('../resolver')['NaivePlusResolver']

let NaivePlusResolver: Resolver

const originalSSR = process.env.SSR

const resolve = (name: string, options?: NaivePlusResolverOptions) => {
  const resolver = NaivePlusResolver(options)
  const resolveFn = typeof resolver === 'function' ? resolver : resolver.resolve
  return (resolveFn(name) as ComponentInfo | undefined)?.sideEffects
}

beforeEach(async () => {
  // vitest 会注入 SSR 环境变量，这里清除以校验非 SSR 分支的样式导入
  delete process.env.SSR
  vi.resetModules()
  NaivePlusResolver = (await import('../resolver')).NaivePlusResolver
})

afterEach(() => {
  if (originalSSR === undefined) {
    delete process.env.SSR
  } else {
    process.env.SSR = originalSSR
  }
})

describe('NaivePlusResolver', () => {
  test('无样式依赖的组件只导入自身样式', () => {
    expect(resolve('NpButton')).toBe('naive-plus/es/np-button/style/index.css')
  })

  test('np-cell-group 会同时导入 np-cell 样式', () => {
    expect(resolve('NpCellGroup')).toEqual([
      'naive-plus/es/np-cell/style/index.css',
      'naive-plus/es/np-cell-group/style/index.css',
    ])
  })

  test('np-table 会递归导入全部依赖组件的样式', () => {
    expect(resolve('NpTable')).toEqual([
      'naive-plus/es/np-cell/style/index.css',
      'naive-plus/es/np-cell-group/style/index.css',
      'naive-plus/es/np-filter/style/index.css',
      'naive-plus/es/np-button/style/index.css',
      'naive-plus/es/np-checkbox/style/index.css',
      'naive-plus/es/np-radio/style/index.css',
      'naive-plus/es/np-upload/style/index.css',
      'naive-plus/es/np-form/style/index.css',
      'naive-plus/es/np-table/style/index.css',
    ])
  })

  test('importStyle 为 scss 时返回 scss 路径', () => {
    expect(resolve('NpCellGroup', { importStyle: 'scss' })).toEqual([
      'naive-plus/es/np-cell/style/index.scss',
      'naive-plus/es/np-cell-group/style/index.scss',
    ])
  })

  test('importStyle 为 false 时不导入任何样式', () => {
    expect(resolve('NpTable', { importStyle: false })).toBeUndefined()
  })

  test('非 np- 前缀的组件不做处理', () => {
    expect(resolve('NButton')).toBeUndefined()
  })
})
