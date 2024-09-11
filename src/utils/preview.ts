import { renderAsync } from 'docx-preview'
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs'
import { VNode, createApp, h, onUnmounted, resolveComponent } from 'vue'
import { TypographyParagraph, Image } from '@arco-design/web-vue'
import pptxml, { SimplifiedNode } from '@/plugins/pptxml'
import processPptx, { ChartData, DataMat, PostMessage, Worker } from '@/plugins/processPpt'
import dimple from 'dimple'
import { isNumber } from './is'
import Prism from 'prismjs'

interface DocxOpionts {
  bodyContainer?: HTMLElement | null
  styleContainer?: HTMLElement
  buffer: Blob
  docxOptions?: Partial<Record<string, string | boolean>>
}

interface Viewport {
  width: number
  height: number
  viewBox: Array<number>
}

interface RenderContext {
  canvasContext: CanvasRenderingContext2D | null
  transform: Array<number>
  viewport: Viewport
}

interface PDFPageProxy {
  pageNumber: number
  getViewport: () => Viewport
  render: (options: RenderContext) => void
}

interface PDFDocumentProxy {
  numPages: number
  getPage: (x: number) => Promise<PDFPageProxy>
}

class PdfPreview {
  private pdfDoc: PDFDocumentProxy | undefined
  pageNumber: number
  total: number
  dom: HTMLElement
  pdf: string | ArrayBuffer
  constructor(pdf: string | ArrayBuffer, dom: HTMLElement | undefined) {
    this.pageNumber = 1
    this.total = 0
    this.pdfDoc = undefined
    this.pdf = pdf
    this.dom = dom ? dom : document.body
  }
  private getPdfPage = (number: number) => {
    return new Promise((resolve, reject) => {
      if (this.pdfDoc) {
        this.pdfDoc.getPage(number).then((page: PDFPageProxy) => {
          const viewport = page.getViewport()
          const canvas = document.createElement('canvas')
          this.dom.appendChild(canvas)
          const context = canvas.getContext('2d')
          const [_, __, width, height] = viewport.viewBox
          canvas.width = width
          canvas.height = height
          viewport.width = width
          viewport.height = height
          canvas.style.width = Math.floor(viewport.width) + 'px'
          canvas.style.height = Math.floor(viewport.height) + 'px'
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            transform: [1, 0, 0, -1, 0, viewport.height],
          }
          page.render(renderContext)
          resolve({ success: true, data: page })
        })
      } else {
        reject({ success: false, data: null, message: 'pdfDoc is undefined' })
      }
    })
  }
  pdfPreview = () => {
    const url = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url)
    pdfjs.GlobalWorkerOptions.workerSrc = url.href
    pdfjs
      .getDocument(this.pdf)
      .promise.then(async (doc: PDFDocumentProxy) => {
        this.pdfDoc = doc
        this.total = doc.numPages
        for (let i = 1; i <= this.total; i++) {
          await this.getPdfPage(i)
        }
      })
  }
  prevPage = () => {
    if (this.pageNumber > 1) {
      this.pageNumber -= 1
    } else {
      this.pageNumber = 1
    }
    this.getPdfPage(this.pageNumber)
  }
  nextPage = () => {
    if (this.pageNumber < this.total) {
      this.pageNumber += 1
    } else {
      this.pageNumber = this.total
    }
    this.getPdfPage(this.pageNumber)
  }
}

const createReader = (buffer: Blob): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(buffer)
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.onabort = (abort) => {
      reject(abort)
    }
  })
}

export const videoRender = async (buffer: Blob, container: HTMLElement) => {
  
  const url = URL.createObjectURL(buffer)
  const wrapper: VNode = h('video',
    {
      src: url,
      controls: true,
      width: 800,
      height: 450,
      poster: '',
      preload: 'metadata',
      crossorigin: 'anonymous',
      style: {
        background: '#000000',
        objectFit: 'contain'
      }
    }
  )
  const app = createApp({
    render: () => wrapper
  })
  app.mount(container)
  onUnmounted(() => {
    URL.revokeObjectURL(url)
  })
}

export const imageRender = async (buffer: Blob, container: HTMLElement) => { 
  const url = URL.createObjectURL(buffer)
  const wrapper: VNode = h(Image, { src: url, preview: false })
  const app = createApp({
    render: () => wrapper
  })
  app.mount(container)
  onUnmounted(() => {
    URL.revokeObjectURL(url)
  })
}
export const textRender = async (buffer: Blob, container: HTMLElement) => {
  const text = await buffer.text()
  const wrapper: VNode = h(TypographyParagraph, { style: { textAlign: 'left' } }, text)
  const app = createApp({
    render: () => wrapper
  })
  app.mount(container)
}

export const codeRender = async (buffer: Blob, container: HTMLElement, fileExtension: string) => {
  const text = await buffer.text()
  const wrapper: VNode = h(
    'pre',
    { style: { textAlign: 'left' }, class: 'line-numbers'},
    h('code', { class: 'language-' + fileExtension }, text)
  )
  const app = createApp({
    render: () => wrapper
  })
  app.mount(container)
  Prism.highlightAll()
}

export const renderPdf = async (buffer: Blob, dom?: HTMLElement): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      const pdf = await createReader(buffer)
      if (pdf) {
        const PDF = new PdfPreview(pdf, dom)
        PDF.pdfPreview()
      }
    }
  } catch (error) {
    console.log('renderPdf', error)
  }
}

export const renderDocx = (options: DocxOpionts): Promise<void> | undefined => {
  if (typeof window !== 'undefined') {
    const { bodyContainer, styleContainer, buffer, docxOptions = {} } = options
    const defaultOptions = {
      className: 'docx',
      ignoreLastRenderedPageBreak: false,
    }
    const configuration = Object.assign({}, defaultOptions, docxOptions)
    if (bodyContainer) {
      return renderAsync(buffer, bodyContainer, styleContainer, configuration)
    } else {
      const contain = document.createElement('div')
      document.body.appendChild(contain)
      return renderAsync(buffer, contain, styleContainer, configuration)
    }
  }
}

export const renderPptx = async (buffer: Blob, dom?: HTMLElement, thumb?: HTMLElement): Promise<number> => {
  if (dom) {
    // const wrapper: VNode = h('div', { class: 'pptx-wrapper' })
    const styleCssArray: string[] = [`<style>${pptxCss}</style>`]
    const slides: string[] = []
    let isDone = false
    return new Promise<number>((resolve, reject) => {
      const processMessage = (message: PostMessage) => { 
        if (isDone) return
        switch (message.type) {
          case 'slide':
            slides.push(message.data as string)
            break
          case 'pptx-thumb':
            if (thumb) {
              thumb.setAttribute('src', `data:image/jpeg;base64,${message.data}`)
            }
            break
          case 'slideSize': break
          case 'globalCSS':
            slides.push(`<style>${message.data}</style>`)
            break
          case 'Done':
            isDone = true
            processCharts(message.data?.charts)
            resolve(message.data?.time)
            break
          case 'WARN':
            console.warn("PPTX processing warning: ", message.data)
            break
          case 'ERROR':
            isDone = true
            console.error("PPTX processing error: ", message.data)
            reject(new Error(message.data as string))
            break
          case 'DEBUG': break
          case 'INFO': 
          default:
        }
      }
      const worker: Worker = {
        postMessage: (e: PostMessage) => {},
        terminate: () => {}
      }
      processPptx((func) => {
        worker.postMessage = func
      }, processMessage)
      console.log(worker.postMessage, 'worker');
      
      worker.postMessage({
        type: 'processPPTX',
        data: buffer,
      })
    }).then((time: number) => {
      // const resize = () => {
      //   childrens.forEach(item => item.type)
      //   const slidesWidth = Math.max(
      //     ...Array.from($wrapper.children("section")).map((s) => s.offsetWidth)
      //   )
      //   const wrapperWidth = $wrapper[0].offsetWidth;
      //   $wrapper.css({
      //     transform: `scale(${wrapperWidth / slidesWidth})`,
      //     "transform-origin": "top left",
      //   });
      // };
      // resize();
      // window.addEventListener("resize", resize);
      let cssStr = ''
      let slidesStr = ''
      styleCssArray.forEach(item => cssStr += item)
      slides.forEach(item => slidesStr += item)
      const wrapper = `<div class="pptx-wrapper">${cssStr + slides}</div>`
      console.log(wrapper, 'wrapper');
      dom.innerHTML = wrapper
      setNumericBullets(dom.querySelectorAll('.block'))
      setNumericBullets(dom.querySelectorAll('table td'))
      return time
    })
    
  }
  return 1
}

const setNumericBullets = (el: NodeListOf<HTMLElement>): void => {
  const paragraphsArray = el
  for (let i = 0; i < paragraphsArray.length; i++) { 
    const paragraphs = paragraphsArray[i]
    const buSpan: NodeListOf<HTMLElement> = paragraphs.querySelectorAll<HTMLElement>('.numeric-bullet-style')
    if (buSpan.length > 0) {
      let prevBultTyp = ''
      let prevBultLvl = ''
      let buletIndex = 0
      const tmpArry: number[] = []
      let tmpArryIndx = 0
      const buletTypSrry: string[] = []
      for (let j = 0; j < buSpan.length; j++) {
        const bulletType = buSpan[j].dataset['bulltname'] as string
        const bulletLvl = buSpan[j].dataset['bulltlvl'] as string
        if (buletIndex === 0) {
          prevBultTyp = bulletType
          prevBultLvl = bulletLvl
          tmpArry[tmpArryIndx] = buletIndex
          buletTypSrry[tmpArryIndx] = bulletType
          buletIndex++
        } else {
          if (bulletType === prevBultTyp && bulletLvl === prevBultLvl) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            buletIndex++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bulletType
          } else if (bulletType !== prevBultTyp && bulletLvl === prevBultLvl) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            tmpArryIndx++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bulletType
            buletIndex = 1
          } else if (bulletType !== prevBultTyp && Number(bulletLvl) > Number(prevBultLvl)) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            tmpArryIndx++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bulletType
            buletIndex = 1
          } else if (bulletType !== prevBultTyp && Number(bulletLvl) < Number(prevBultLvl)) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            tmpArryIndx--
            buletIndex = tmpArry[tmpArryIndx] + 1
          }
        }
        const numIdx = getNumTypeNum(buletTypSrry[tmpArryIndx], buletIndex)
        // $(buSpan[j]).html(numIdx);
        buSpan[j].innerHTML = numIdx
      }
    }
  }
}

const getNumTypeNum = (numTyp: string, num: number): string => {
  let rtrnNum = ''
  switch (numTyp) {
    case 'arabicPeriod':
      rtrnNum = num + '. '
      break
    case 'arabicParenR':
      rtrnNum = num + ') '
      break
    case 'alphaLcParenR':
      rtrnNum = alphaNumeric(num, 'lowerCase') + ') '
      break
    case 'alphaLcPeriod':
      rtrnNum = alphaNumeric(num, 'lowerCase') + '. '
      break

    case 'alphaUcParenR':
      rtrnNum = alphaNumeric(num, 'upperCase') + ') '
      break
    case 'alphaUcPeriod':
      rtrnNum = alphaNumeric(num, 'upperCase') + '. '
      break
    case 'romanUcPeriod':
      rtrnNum = romanize(num) + '. '
      break
    case 'romanLcParenR':
      rtrnNum = romanize(num) + ') '
      break
    case 'hebrew2Minus':
      rtrnNum = hebrew2Minus.format(num) + '-'
      break
    default:
      rtrnNum = String(num)
  }
  return rtrnNum
}


const archaicNumbers = (arr: Array<[RegExp | number, string]>) => {
  return {
    format(n: number) {
      let ret = ''
      for (const i in arr) {
        const item = arr[i]
        const num = item[0]
        if (isNumber(num)) {
          for (; n >= num; n -= num) ret += item[1]
        } else {
          ret = ret.replace(num, this[1])
        }
      }
      return ret
    }
  }
}

const hebrew2Minus = archaicNumbers([
  [1000, ''],
  [400, "ת"],
  [300, "ש"],
  [200, "ר"],
  [100, "ק"],
  [90, "צ"],
  [80, "פ"],
  [70, "ע"],
  [60, "ס"],
  [50, "נ"],
  [40, "מ"],
  [30, "ל"],
  [20, "כ"],
  [10, "י"],
  [9, "ט"],
  [8, "ח"],
  [7, "ז"],
  [6, "ו"],
  [5, "ה"],
  [4, "ד"],
  [3, "ג"],
  [2, "ב"],
  [1, "א"],
  [/יה/, "ט״ו"],
  [/יו/, "ט״ז"],
  [/([א-ת])([א-ת])$/, "$1״$2"],
  [/^([א-ת])$/, "$1׳"],
])


const processCharts = (queue: ChartData[]) => {
  for (let i = 0; i < queue.length; i++) {
    processSingleChart(queue[i].data)
  }
}

const processSingleChart = (
  d: {
    chartID: string
    chartType: 'lineChart' | 'barChart' | 'pieChart' | 'pie3DChart' | 'areaChart' | 'scatterChart'
    chartData: DataMat[] | string | number[][]
  }
) => {
  const chartID = d.chartID
  const chartType = d.chartType
  const chartData = d.chartData

  let data: { name?: string, group?: string, value?: number, key?: string, values?: { x: number, y: number }[] }[] | DataMat[] | string | number[][] = []

  switch (chartType) {
    case 'lineChart': {
      const { data: data_, xLabels, groupLabels } = convertChartData(chartData as DataMat[])
      data = data_
      const container = document.getElementById(chartID)
      const svg = dimple.newSvg(`#${chartID}`, container?.style.width, container?.style.height)
      const myChart = new dimple.chart(svg, data)
      const xAxis = myChart.addCategoryAxis('x', 'name')
      xAxis.addOrderRule(xLabels)
      xAxis.addGroupOrderRule(groupLabels)
      xAxis.title = null
      const yAxis = myChart.addMeasureAxis('y', 'value')
      yAxis.title = null
      myChart.addSeries('group', dimple.plot.line)
      myChart.addLegend(60, 10, 500, 20, 'right')
      myChart.draw()
      break
    }
    case 'barChart': {
      const { data: data_, xLabels, groupLabels } = convertChartData(chartData as DataMat[])
      data = data_
      const container = document.getElementById(chartID);
      const svg = dimple.newSvg(`#${chartID}`, container?.style.width, container?.style.height)
      const myChart = new dimple.chart(svg, data)
      const xAxis = myChart.addCategoryAxis('x', ['name', 'group'])
      xAxis.addOrderRule(xLabels)
      xAxis.addGroupOrderRule(groupLabels)
      xAxis.title = null
      const yAxis = myChart.addMeasureAxis('y', 'value')
      yAxis.title = null
      myChart.addSeries('group', dimple.plot.bar)
      myChart.addLegend(60, 10, 500, 20, 'right')
      myChart.draw()
      break
    }
    case 'pieChart':
    case 'pie3DChart': {
      const { data: data_, groupLabels} = convertChartData(chartData as DataMat[])
      data = data_
      const container = document.getElementById(chartID)
      const svg = dimple.newSvg(`#${chartID}`, container?.style.width, container?.style.height)
      const myChart = new dimple.chart(svg, data)
      const pieAxis = myChart.addMeasureAxis('p', 'value')
      pieAxis.addOrderRule(groupLabels)
      myChart.addSeries('name', dimple.plot.pie)
      myChart.addLegend(50, 20, 400, 300, 'left')
      myChart.draw()
      break
    }
    case 'areaChart': {
      const { data: data_, xLabels, groupLabels} = convertChartData(chartData as DataMat[])
      data = data_
      const container = document.getElementById(chartID)
      const svg = dimple.newSvg(`#${chartID}`, container?.style.width, container?.style.height)

      const myChart = new dimple.chart(svg, data)
      const xAxis = myChart.addCategoryAxis('x', 'name')
      xAxis.addOrderRule(xLabels)
      xAxis.addGroupOrderRule(groupLabels)
      xAxis.title = null
      const yAxis = myChart.addMeasureAxis('y', 'value')
      yAxis.title = null
      myChart.addSeries('group', dimple.plot.area)
      myChart.addLegend(60, 10, 500, 20, 'right')
      myChart.draw()
      break
    }
    case 'scatterChart': {
      for (let i = 0; i < (chartData as number[][]).length; i++) {
        const arr: { x: number, y: number }[] = []
        for (let j = 0; j < (chartData as number[][])[i].length; j++) {
          arr.push({ x: j, y: (chartData as number[][])[i][j]})
        }
        (data as { name?: string, group?: string, value?: number, key?: string, values?: { x: number, y: number }[] }[]).push({ key: 'data' + (i + 1), values: arr })
      }
      data = chartData
      const chart = dimple.models.scatterChart()
        .showDistX(true)
        .showDistY(true)
        .color(d3.scale.category10().range())
      chart.xAxis.axisLabel('X').tickFormat(d3.format('.02f'))
      chart.yAxis.axisLabel('Y').tickFormat(d3.format('.02f'))
      dimple.nvDraw(chart, data)
      break
    }
    default:
  }
}

const convertChartData = (chartData: { key: string, values: { x: number, y: number }[], xlabels: SimplifiedNode }[]) => {
  const data: { name: string, group: string, value: number }[] = []
  const xLabels: any[] = []
  const groupLabels: string[] = []
  chartData.forEach((group, index) => {
    const groupName = group.key
    groupLabels[index] = group.key
    group.values.forEach((value, i) => {
      const labelName = group.xlabels[i] as string
      xLabels[i] = group.xlabels[i]
      data.push({
        name: labelName,
        group: groupName,
        value: value.y
      })
    })
  })
  return { data, xLabels, groupLabels }
}

const alphaNumeric = (num: number | string, upperLower: string): string => {
  num = Number(num) - 1
  let aNum = ''
  if (upperLower === 'upperCase') {
    aNum = ((num / 26 >= 1 ? String.fromCharCode(num / 26 + 64) : '') + String.fromCharCode((num % 26) + 65)).toUpperCase()
  } else if (upperLower === 'lowerCase') {
    aNum = ((num / 26 >= 1 ? String.fromCharCode(num / 26 + 64) : '') + String.fromCharCode((num % 26) + 65)).toLowerCase()
  }
  return aNum
}

const romanize = (num: number): boolean | string => {
  if (!+num) return false
  const digits = String(+num).split('')
  const key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM', '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC', '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']
  let roman = ''
  let i = 3
  while (i--) {
    roman = (key[Number(digits.pop() ? digits.pop() : 0) + i * 10] || '') + roman
  }
  return new Array(Number(digits.join()) + 1).join('M') + roman
}


const pptxCss = `section {
  width: 100%;
  height: 690px;
  position: relative;
  border: 1px solid #333;
  background-color: #EFEFEF;
  text-align: center;
  border-radius: 10px;
  box-shadow: 1px 1px 3px #AAA;
  overflow: hidden;
}

section div.block {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

section div.content {
  display: flex;
  flex-direction: column;
  /*
  justify-content: center;
  align-items: flex-end;
  */
}

section div.v-up {
  justify-content: flex-start;
}
section div.v-mid {
  justify-content: center;
}
section div.v-down {
  justify-content: flex-end;
}
section div.h-left {
  align-items: flex-start;
  text-align: left;
}
section div.h-mid {
  align-items: center;
  text-align: center;
}
section div.h-right {
  align-items: flex-end;
  text-align: right;
}
section div.up-left {
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
}
section div.up-center {
  justify-content: flex-start;
  align-items: center;
}
section div.up-right {
  justify-content: flex-start;
  align-items: flex-end;
}
section div.center-left {
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
section div.center-center {
  justify-content: center;
  align-items: center;
}
section div.center-right {
  justify-content: center;
  align-items: flex-end;
}
section div.down-left {
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
}
section div.down-center {
  justify-content: flex-end;
  align-items: center;
}
section div.down-right {
  justify-content: flex-end;
  align-items: flex-end;
}

section span.text-block {
  /* display: inline-block; */
}

li.slide {
  margin: 10px 0;
  font-size: 18px;
}

div.footer {
  text-align: center;
}

section table {
  position: absolute;
}

section table, section th, section td {
  border: 1px solid black;
}

section svg.drawing {
  position: absolute;
  overflow: visible;
}`

