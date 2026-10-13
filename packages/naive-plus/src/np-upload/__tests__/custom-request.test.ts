import { describe, test, expect, vi, afterEach } from 'vitest'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { customRequest } from '../src/custom-request'

const createXhrMock = () => {
  const instance = {
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn(),
    addEventListener: vi.fn(),
    upload: { addEventListener: vi.fn() },
    withCredentials: false,
    status: 200,
    response: '{}',
  }
  vi.stubGlobal(
    'XMLHttpRequest',
    vi.fn(() => instance)
  )
  return instance
}

const createOptions = (): UploadCustomRequestOptions =>
  ({
    file: { file: new File(['x'], 'a.txt') },
    headers: {},
    withCredentials: false,
    action: 'https://example.com/upload',
    onFinish: vi.fn(),
    onError: vi.fn(),
    onProgress: vi.fn(),
  }) as unknown as UploadCustomRequestOptions

describe('customRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('未配置 method 时默认使用 POST', () => {
    const xhr = createXhrMock()
    customRequest(createOptions())
    expect(xhr.open).toHaveBeenCalledWith('POST', 'https://example.com/upload')
  })

  test('透传 props.method', () => {
    const xhr = createXhrMock()
    customRequest(createOptions(), { method: 'PUT' })
    expect(xhr.open).toHaveBeenCalledWith('PUT', 'https://example.com/upload')
  })
})
