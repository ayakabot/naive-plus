import { computed, defineComponent, inject, onUnmounted, ref, watch } from 'vue'
import { useCreate } from '../../_hooks/create'
import { useConfigProps, useLocale } from '../../_hooks/config'
import { npUploadProps } from './props'
import { NButton, NUpload } from 'naive-ui'
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui'
import { customRequest } from './custom-request'
import type { FormItemToolInjection } from '../..'

const { name, bemClass } = useCreate('np-upload')

const isImageCard = (options: { props?: { listType?: string } }) =>
  options.props?.listType === 'image-card'

const fileListToModelValue = (
  fileList: UploadFileInfo[],
  urlOnly: boolean,
  imageCard: boolean
): string[] => {
  if (urlOnly && imageCard) {
    return fileList.map(f => f.url ?? '')
  }
  return fileList.map(f =>
    JSON.stringify({
      name: f.name,
      url: f.url,
      status: f.status,
      type: f.type,
    })
  )
}

const modelValueToFileList = (
  value: string[],
  urlOnly: boolean,
  imageCard: boolean
): UploadFileInfo[] => {
  return value.map((item, index) => {
    if (urlOnly && imageCard) {
      return {
        id: String(index),
        name: item,
        url: item,
        status: 'finished',
      }
    }
    try {
      const parsed = JSON.parse(item)
      return {
        id: String(index),
        name: parsed.name ?? '',
        url: parsed.url ?? '',
        type: parsed.type,
        status: parsed.status ?? 'finished',
      }
    } catch {
      return { id: String(index), name: item, status: 'finished' as const }
    }
  })
}

export default defineComponent({
  name,
  props: npUploadProps,
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    // prop > np-config-provider > 内置默认值
    const merged = useConfigProps('Upload', props, {}, ['props'])
    // np-config-provider 注入的文案
    const locale = useLocale()
    const imageCard = computed(() => isImageCard(merged.value))
    const blobUrls = new Set<string>()
    // `modelValue` 的格式由转换时的 `imageCard` 决定，因此 fileList 只在初始化与
    // `modelValue` 变化时转换；provider 运行期改变 `listType` 时不重新解析既有字符串，
    // 避免把已按旧格式存储的数据误判为新格式（后续上传会按新配置输出，自动收敛）
    const fileList = ref<UploadFileInfo[]>(
      modelValueToFileList(
        props.modelValue || [],
        props.urlOnly,
        imageCard.value
      )
    )

    let isInternalChange = false

    /**
     * 回收已从当前文件列表中移除的 Blob URL
     */
    const revokeRemovedBlobUrls = (urls: (string | null | undefined)[]) => {
      const kept = new Set(
        urls.filter((url): url is string => !!url && url.startsWith('blob:'))
      )
      blobUrls.forEach(url => {
        if (!kept.has(url)) {
          URL.revokeObjectURL(url)
          blobUrls.delete(url)
        }
      })
    }

    watch(
      () => props.modelValue,
      val => {
        if (isInternalChange) {
          isInternalChange = false
          return
        }
        fileList.value = modelValueToFileList(
          val || [],
          props.urlOnly,
          imageCard.value
        )
        revokeRemovedBlobUrls(fileList.value.map(f => f.url))
      },
      { deep: true }
    )

    onUnmounted(() => {
      blobUrls.forEach(url => URL.revokeObjectURL(url))
      blobUrls.clear()
    })

    const handleUpdateFileList = (value: UploadFileInfo[]) => {
      const processedFiles = value.map(f => {
        if (!f.url && f.file) {
          const blobUrl = URL.createObjectURL(f.file)
          blobUrls.add(blobUrl)
          return { ...f, url: blobUrl }
        }
        return f
      })
      fileList.value = processedFiles
      revokeRemovedBlobUrls(processedFiles.map(f => f.url))
      isInternalChange = true
      const modelValue = fileListToModelValue(
        processedFiles,
        props.urlOnly,
        imageCard.value
      )
      emit('update:modelValue', modelValue)
      // 改变事件属于使用时的业务逻辑，只取组件自身的 props
      props.onChange?.(modelValue, processedFiles)
    }

    const formItemTool = inject<FormItemToolInjection>('np-form-item-tool', {
      setFeedback: () => {},
    })

    const handleCustomRequest = (options: UploadCustomRequestOptions): void => {
      const naiveProps = merged.value.props
      if (naiveProps?.customRequest !== undefined) {
        naiveProps.customRequest(options)
        return
      }
      if (naiveProps?.action === undefined) {
        return
      }
      customRequest(options, naiveProps)
        .then(() => {
          formItemTool?.setFeedback?.()
        })
        .catch(err => {
          const message = err.message || locale.value.Upload.unknownError
          formItemTool?.setFeedback?.(
            `${locale.value.Upload.uploadFailedTip}: ${message}`,
            'error'
          )
        })
    }

    const acceptCompute = computed(() => {
      return (
        merged.value.props?.accept ||
        (imageCard.value
          ? 'image/png, image/jpeg, image/jpg, image/webp'
          : undefined)
      )
    })

    return () => (
      <div class={bemClass.value}>
        <NUpload
          {...merged.value.props}
          responseType={merged.value.props?.responseType ?? 'json'}
          fileList={fileList.value}
          listType={merged.value.props?.listType ?? 'image'}
          onUpdateFileList={handleUpdateFileList}
          customRequest={handleCustomRequest}
          accept={acceptCompute.value}
        >
          {slots.default?.() ?? (
            <NButton>{locale.value.Upload.uploadBtnText}</NButton>
          )}
        </NUpload>
      </div>
    )
  },
})
