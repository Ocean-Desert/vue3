import { PropType, defineComponent, onMounted, ref } from 'vue'
import style from './index.module.scss'
import { renderDocx } from '@/utils/preview'
import { PreviewStrategyManager } from './strategy'
import '@vue-office/excel/lib/index.css'


interface PreviewProps {
  buffer?: Blob
  fileName?: string
}

export default defineComponent((props: PreviewProps) => {
  const { buffer, fileName } = props
  const previewRef = ref<HTMLElement>()
  const switchPreviewStrategy = () => {
    const manager = new PreviewStrategyManager()
    const fileExtension = getFileExtension(fileName)
    if (fileExtension && buffer && previewRef.value) {
      manager.preview(buffer, previewRef.value, getFileExtension(fileName))
    }
  }
  const getFileExtension = (file: string | undefined): string => {
    const index = file?.lastIndexOf('.')
    if (!index || index === -1) {
      return ''
    }
    return (file as string).slice(index + 1)
  }
  onMounted(() => {
    switchPreviewStrategy()
  })
  return () => (
    <>
      <div ref={previewRef} class={style.preview}></div>
    </>
  )
}, {
  props: {
    buffer: {
      type: Blob as PropType<Blob>
    },
    fileName: {
      type: String as PropType<string>
    }
  }
})

