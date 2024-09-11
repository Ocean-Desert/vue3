import { renderDocx, renderPptx, renderPdf, codeRender, textRender, imageRender, videoRender } from '@/utils/preview'
import VueOfficeExcel from '@vue-office/excel'
import { createApp } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'

interface PreviewStrategy {
  condition(fileExtension: string): boolean
  preview(buffer: Blob, container: HTMLElement, fileExtension?: string): void
}

class WrodPreviewStrategy implements PreviewStrategy {
  condition(fileExtension: string): boolean {
    return ['docx'].includes(fileExtension)
  }
  preview(buffer: Blob, container: HTMLElement) {
    renderDocx({ buffer, bodyContainer: container })
  }
}

class PdfPreviewStrategy implements PreviewStrategy {
  condition(fileExtension: string): boolean {
    return fileExtension === 'pdf'
  }
  preview(buffer: Blob, container: HTMLElement) {
    renderPdf(buffer, container)
  }
}

class ExcelPreviewStrategy implements PreviewStrategy {
  condition(fileExtension: string): boolean {
    return ['xlsx'].includes(fileExtension)
  }
  preview(buffer: Blob, container: HTMLElement) {
    const excelComponent = createApp(VueOfficeExcel, { src: buffer, style: { height: '500px' } })
    excelComponent.mount(container)
  }
}

class PPTPreviewStrategy implements PreviewStrategy {
  condition(fileExtension: string): boolean {
    return ['pptx'].includes(fileExtension)
  }
  async preview(buffer: Blob, container: HTMLElement) {
    await renderPptx(buffer, container)
  }
}

class CodePreviewStrategy implements PreviewStrategy {
  condition(fileExtension: string): boolean {
    return ['js', 'ts', 'java', 'css', 'sql', 'xml', 'html', 'json', 'yaml', 'yml', 'css'].includes(fileExtension)
  }
  async preview(buffer: Blob, container: HTMLElement, fileExtension?: string) {
    await codeRender(buffer, container, fileExtension as string)
  }
}

class TextPreviewStrategy implements PreviewStrategy {
  condition(fileExtension: string): boolean {
    return ['txt', 'log'].includes(fileExtension)
  }
  async preview(buffer: Blob, container: HTMLElement) {
    await textRender(buffer, container)
  }
}

class VideoPreviewStrategy implements PreviewStrategy { 
  condition(fileExtension: string): boolean {
    return ['mp4'].includes(fileExtension)
  }
  async preview(buffer: Blob, container: HTMLElement) {
    await videoRender(buffer, container)
  }
}

class ImagePreviewStrategy implements PreviewStrategy {
  condition(fileExtension: string): boolean {
    return ['jpg', 'png', 'gif', 'jpeg', 'svg'].includes(fileExtension)
  }
  async preview(buffer: Blob, container: HTMLElement) {
    await imageRender(buffer, container)
  }
}



export class PreviewStrategyManager {
  private previewStrategy: PreviewStrategy[] = []
  constructor() {
    this.previewStrategy.push(new WrodPreviewStrategy())
    this.previewStrategy.push(new PdfPreviewStrategy())
    this.previewStrategy.push(new ExcelPreviewStrategy())
    this.previewStrategy.push(new PPTPreviewStrategy())
    this.previewStrategy.push(new CodePreviewStrategy())
    this.previewStrategy.push(new TextPreviewStrategy())
    this.previewStrategy.push(new ImagePreviewStrategy())
    this.previewStrategy.push(new VideoPreviewStrategy())
  }
  preview(buffer: Blob, container: HTMLElement, fileExtension: string) {
    const { t } = useI18n()
    const strategy = this.previewStrategy.find(item => item.condition(fileExtension))
    if (strategy) {
      strategy.preview(buffer, container, fileExtension)
    } else {
      Message.error({ content: t('views.monitor.file.cannotPreview') })
    }
  }
}