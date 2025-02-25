import { defineComponent, computed, ref, nextTick, watch } from 'vue'
import type { PropType } from 'vue'
import { preview } from '@/api/tool/gen'
import { getFileExtension, to } from '@/utils'
import { useAppStore } from '@/store'
import { Message } from '@arco-design/web-vue'
import Prism from 'prismjs'

export interface PreviewCodeProps {
  tableId?: number
}

export interface PreviewCodeExposed {
  showModal: () => void
}

export default defineComponent((props: PreviewCodeProps, { expose }) => {
  const visible = ref(false)
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const previewCode = ref<Record<string, string>>({})
  const loading = ref(false)

  const fetchData = async () => {
    if (!props.tableId) return

    loading.value = true
    // 清空之前的数据
    previewCode.value = {}

    const [err, response] = await to<ApiSpace.Result<Record<string, string>>>(
      preview(props.tableId),
      () => loading.value = false
    )

    if (err) {
      Message.error('获取预览数据失败')
      return
    }

    if (!response.success) {
      Message.error(response.msg || '获取预览数据失败')
      return
    }

    previewCode.value = response.data as Record<string, string>
    // 等待数据更新后再执行高亮
    await nextTick()
    Prism.highlightAll()
  }

  const extractFileNamePart = (str: string) => {
    const startIndex = str.lastIndexOf('/') + 1
    const endIndex = str.indexOf('.ftl')
    return str.substring(startIndex, endIndex)
  }

  const showModal = () => {
    visible.value = true
  }

  // 监听 tableId 的变化
  watch(() => props.tableId, (newVal, oldVal) => {
    // 只有当 tableId 真实变化且弹窗显示时才重新获取数据
    if (newVal && newVal !== oldVal && visible.value) {
      fetchData()
    }
  })

  // 监听弹窗显示状态
  watch(() => visible.value, (newVal) => {
    if (newVal && props.tableId) {
      fetchData()
    }
  })

  expose({ showModal })

  return () => (
    <>
      <a-modal 
        v-model:visible={visible.value} 
        title={'预览'}
        width={1024}
        maskClosable={false}
        loading={loading.value}
      >
        {loading.value ? (
          <a-spin dot />
        ) : (
          <a-tabs size={size.value} type={'rounded'}>
            {Object.keys(previewCode.value).map((key: string, index: number) => (
              <a-tab-pane 
                key={index} 
                title={extractFileNamePart(key)}
              >
                <pre>
                  <code class={`language-${getFileExtension(extractFileNamePart(key))} line-numbers`}>
                    {previewCode.value[key]}
                  </code>
                </pre>
              </a-tab-pane>
            ))}
          </a-tabs>
        )}
      </a-modal>
    </>
  )
}, {
  props: {
    tableId: {
      required: false,
      type: Number as PropType<number>
    }
  }
})