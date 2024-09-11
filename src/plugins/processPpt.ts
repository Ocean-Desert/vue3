import JSZip from 'jszip'
import pptxml, { SimplifiedNode } from './pptxml'
import { Color } from './pptColor'

export type MessageType = 'slide' | 'pptx-thumb' | 'slideSize' | 'globalCSS' | 'Done' | 'WARN' | 'ERROR' | 'DEBUG' | 'INFO' | 'processPPTX' | 'progress-update'

export interface PostMessage {
  type: MessageType
  data: any
  charts?: any[]
  time?: number
}

export interface Worker {
  postMessage: (msg: PostMessage) => void
  terminate: () => void
}

export interface ChartData {
  type: string
  data: {
    chartID: string
    chartType: 'lineChart' | 'barChart' | 'pieChart' | 'pie3DChart' | 'areaChart' | 'scatterChart'
    chartData: DataMat[] | string | number[][]
  }
}

export interface Border {
  color: string
  width: number
  type: string
  strokeDasharray: string
}

export interface GradientFill {
  color: (string | number)[]
  rot: number
}

export interface WarpObj {
  zip: JSZip,
  slideLayoutTables: IndexNode
  slideResObj: Record<string, any>
  slideMasterTextStyles: string | Record<string, any> | undefined
  layoutResObj: Record<string, any>
  masterResObj: Record<string, any>
}

export interface IndexNode {
  idTable: Record<string, any>
  idxTable: Record<string, any>
  typeTable: Record<string, any>
}

export type NodeInSlideKey = 'p:sp' | 'p:cxnSp' | 'p:pic' | 'p:graphicFrame' | 'p:grpSp' | string
export interface DataMat {
  key: string
  values: { x: number, y: number }[]
  xlabels: SimplifiedNode
}
export type PtObj = {
  type: string
  order: number
  x: string
  y: string
}
export type ImageSuffix = 'jpg' | 'jpeg' | 'png' | 'gif' | 'emf' | 'wmf' | 'svg' | string
export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/x-emf' | 'image/x-wmf' | 'image/png' | 'image/svg+xml' | 'image/*'
export type FillType = 'SOLID_FILL' | 'GRADIENT_FILL' | 'PIC_FILL' | string | undefined

export default (setOnMessage: (callback: (msg: PostMessage) => void) => void, postMessage: (msg: PostMessage) => void) => {
  const charts: ChartData[] = []
  let chartID = 0
  let themeContent: SimplifiedNode | null = null
  let slideLayoutClrOvride: string | undefined | Record<string, any> = ''
  const styleTable = {}
  let tableStyles: SimplifiedNode
  setOnMessage(async (e: PostMessage) => {
    switch (e.type) {
      case 'processPPTX': {
        try {
          await processPPTX(e.data)
        } catch (err) {
          console.error('AN ERROR HAPPENED DURING processPPTX', err)
          postMessage({
            type: 'ERROR',
            data: err,
          })
        }
        break
      }
      default:
    }
  })
  
  const processPPTX = async (data: Blob) => {
    const zip = await JSZip.loadAsync(data)
    const dateBefore = new Date()
    if (zip.file('docProps/thumbnail.jpeg') !== null) {
      const pptxThumbImg = await zip.file('docProps/thumbnail.jpeg')?.async('base64')
      postMessage({ type: 'pptx-thumb', data: pptxThumbImg })
    }
    const filesInfo = await getContentTypes(zip)
    const slideSize = await getSlideSize(zip)
    themeContent = await loadTheme(zip)
    tableStyles = await readXmlFile(zip, 'ppt/tableStyles.xml')
    postMessage({ type: 'slideSize', data: slideSize })
    const numOfSlides = filesInfo.slides.length
    for (let i = 0; i < numOfSlides; i++) {
      const filename = filesInfo.slides[i]
      const slideHtml = await processSingleSlide(zip, filename, i, slideSize)
      postMessage({
        type: 'slide',
        data: slideHtml,
      })
      postMessage({
        type: 'progress-update',
        data: ((i + 1) * 100) / numOfSlides,
      })
    }
    postMessage({
      type: 'globalCSS',
      data: genGlobalCSS(),
    })
    const dateAfter = new Date()
    postMessage({
      type: 'Done',
      data: {
        time: dateAfter.getTime() - dateBefore.getTime(),
        charts,
      },
    })
  }

  const readXmlFile = async (zip: JSZip, filename: string): Promise<SimplifiedNode> => {
    return pptxml(await zip.file(filename)?.async('text') as string)
  }

  const getContentTypes = async (zip: JSZip): Promise<{ slides: string[], slideLayouts: string[] }> => {
    const contentTypesJson = await readXmlFile(zip, '[Content_Types].xml')
    const subObj = contentTypesJson['Types']['Override']
    const slidesLocArray: string[] = []
    const slideLayoutsLocArray: string[] = []
    for (let i = 0; i < subObj.length; i++) {
      switch (subObj[i]['attrs']['ContentType']) {
        case 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml':
          slidesLocArray.push(subObj[i]['attrs']['PartName'].substr(1))
          break
        case 'application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml':
          slideLayoutsLocArray.push(subObj[i]['attrs']['PartName'].substr(1))
          break
        default:
      }
    }
    return { slides: slidesLocArray, slideLayouts: slideLayoutsLocArray }
  }
  
  const getSlideSize = async (zip: JSZip): Promise<{ width: number, height: number }> => {
    const content = await readXmlFile(zip, 'ppt/presentation.xml')
    const sldSzAttrs = content['p:presentation']['p:sldSz']['attrs']
    return { width: (parseInt(sldSzAttrs['cx']) * 96) / 914400, height: (parseInt(sldSzAttrs['cy']) * 96) / 914400 }
  }

  const loadTheme = async (zip: JSZip): Promise<SimplifiedNode> => {
    const preResContent = await readXmlFile(zip, 'ppt/_rels/presentation.xml.rels')
    const relationshipArray = preResContent['Relationships']['Relationship']
    let themeURI: string | undefined
    if (relationshipArray.constructor === Array) {
      for (let i = 0; i < relationshipArray.length; i++) {
        if (relationshipArray[i]['attrs']['Type'] === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme') {
          themeURI = relationshipArray[i]['attrs']['Target']
          break
        }
      }
    } else if (relationshipArray['attrs']['Type'] === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme') {
      themeURI = relationshipArray['attrs']['Target']
    }
    if (themeURI === undefined) {
      throw new Error(`Can't open theme file.`)
    }
    return await readXmlFile(zip, 'ppt/' + themeURI)
  }

  
  const processSingleSlide = async (zip: JSZip, sldFileName: string, index: number, slideSize: { width: number; height: number }) => {
    postMessage({ type: 'INFO', data: 'Processing slide' + (index + 1) })
    const resName = sldFileName.replace('slides/slide', 'slides/_rels/slide') + '.rels'
    const resContent = await readXmlFile(zip, resName)
    let RelationshipArray = resContent['Relationships']['Relationship']
    let layoutFilename = ''
    const slideResObj = {}
    if (RelationshipArray.constructor === Array) {
      for (let i = 0; i < RelationshipArray.length; i++) {
        switch (RelationshipArray[i]['attrs']['Type']) {
          case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout':
            layoutFilename = RelationshipArray[i]['attrs']['Target'].replace('../', 'ppt/')
            break
          case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide':
          case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image':
          case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart':
          case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink':
          default: {
            slideResObj[RelationshipArray[i]['attrs']['Id']] = {
              type: RelationshipArray[i]["attrs"]["Type"].replace('http://schemas.openxmlformats.org/officeDocument/2006/relationships/', ''),
              target: RelationshipArray[i]["attrs"]["Target"].replace('../', 'ppt/')
            }
          }
        }
      }
    } else {
      layoutFilename = RelationshipArray['attrs']['Target'].replace('../', 'ppt/')
    }
    const slideLayoutContent = await readXmlFile(zip, layoutFilename)
    const slideLayoutTables = indexNodes(slideLayoutContent)
    const sldLayoutClrOvr = slideLayoutContent['p:sldLayout']['p:clrMapOvr']['a:overrideClrMapping']

    if (sldLayoutClrOvr !== undefined) {
      slideLayoutClrOvride = sldLayoutClrOvr['attrs']
    }
    const slideLayoutResFilename = layoutFilename.replace('slideLayouts/slideLayout', 'slideLayouts/_rels/slideLayout') + '.rels'
    const slideLayoutResContent = await readXmlFile(zip, slideLayoutResFilename)
    RelationshipArray = slideLayoutResContent['Relationships']['Relationship']
    let masterFilename = ''
    const layoutResObj = {}
    if (RelationshipArray.constructor === Array) {
      for (let i = 0; i < RelationshipArray.length; i++) {
        switch (RelationshipArray[i]['attrs']['Type']) {
          case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster':
            masterFilename = RelationshipArray[i]['attrs']['Target'].replace('../', 'ppt/')
            break
          default:
            layoutResObj[RelationshipArray[i]['attrs']['Id']] = {
              type: RelationshipArray[i]['attrs']['Type'].replace('http://schemas.openxmlformats.org/officeDocument/2006/relationships/', ''),
              target: RelationshipArray[i]['attrs']['Target'].replace('../', 'ppt/'),
            }
        }
      }
    } else {
      masterFilename = RelationshipArray['attrs']['Target'].replace('../', 'ppt/')
    }
    const slideMasterContent = await readXmlFile(zip, masterFilename)
    const slideMasterTextStyles = getTextByPathList(slideMasterContent, ['p:sldMaster', 'p:txStyles'])
    const slideMasterTables = indexNodes(slideMasterContent)
    const slideMasterResFilename = masterFilename.replace('slideMasters/slideMaster', 'slideMasters/_rels/slideMaster') + '.rels'
    const slideMasterResContent = await readXmlFile(zip, slideMasterResFilename)
    RelationshipArray = slideMasterResContent['Relationships']['Relationship']
    let themeFilename = ''
    const masterResObj = {}
    if (RelationshipArray.constructor === Array) {
      for (let i = 0; i < RelationshipArray.length; i++) {
        switch (RelationshipArray[i]['attrs']['Type']) {
          case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme':
            themeFilename = RelationshipArray[i]['attrs']['Target'].replace('../', 'ppt/')
            break;
          default:
            masterResObj[RelationshipArray[i]['attrs']['Id']] = {
              type: RelationshipArray[i]['attrs']['Type'].replace('http://schemas.openxmlformats.org/officeDocument/2006/relationships/', ''),
              target: RelationshipArray[i]['attrs']['Target'].replace('../', 'ppt/'),
            }
        }
      }
    } else {
      themeFilename = RelationshipArray['attrs']['Target'].replace('../', 'ppt/')
    }
    if (themeFilename !== undefined) {
      themeContent = await readXmlFile(zip, themeFilename)
    }
    const slideContent = await readXmlFile(zip, sldFileName)
    const nodes = slideContent['p:sld']['p:cSld']['p:spTree']
    const warpObj = {
      zip: zip,
      slideLayoutTables: slideLayoutTables,
      slideMasterTables: slideMasterTables,
      slideResObj: slideResObj,
      slideMasterTextStyles: slideMasterTextStyles,
      layoutResObj: layoutResObj,
      masterResObj: masterResObj,
    }
    const bgColor = await getSlideBackgroundFill(slideContent, slideLayoutContent, slideMasterContent, warpObj)
    let result = `<section style="width: ${slideSize.width}px; height: ${slideSize.height}px;${bgColor}">`
    for (let nodeKey in nodes) {
      if (nodes[nodeKey].constructor === Array) {
        for (let i = 0; i < nodes[nodeKey].length; i++) {
          result += await processNodesInSlide(nodeKey, nodes[nodeKey][i], warpObj)
        }
      } else {
        result += await processNodesInSlide(nodeKey, nodes[nodeKey], warpObj)
      }
    }
    return `${result}</section>`
  }

  const processNodesInSlide = async (nodeKey: NodeInSlideKey, nodeValue: SimplifiedNode, warpObj: WarpObj): Promise<string> => {
    let result = ''
    switch (nodeKey) {
      case 'p:sp':
        result = await processSpNode(nodeValue, warpObj)
        break
      case 'p:cxnSp':
        result = await processCxnSpNode(nodeValue, warpObj)
        break
      case 'p:pic':
        result = await processPicNode(nodeValue, warpObj)
        break
      case 'p:graphicFrame':
        result = await processGraphicFrameNode(nodeValue, warpObj)
        break
      case 'p:grpSp':
        result = await processGroupSpNode(nodeValue, warpObj)
        break
      default:
    }
    return result
  }

  const processGroupSpNode = async (node: SimplifiedNode, warpObj: WarpObj): Promise<string> => {
    const factor = 96 / 914400

    const xfrmNode = node['p:grpSpPr']['a:xfrm']
    const x = parseInt(xfrmNode['a:off']['attrs']['x']) * factor
    const y = parseInt(xfrmNode['a:off']['attrs']['y']) * factor
    const chx = parseInt(xfrmNode['a:chOff']['attrs']['x']) * factor
    const chy = parseInt(xfrmNode['a:chOff']['attrs']['y']) * factor
    const cx = parseInt(xfrmNode['a:ext']['attrs']['cx']) * factor
    const cy = parseInt(xfrmNode['a:ext']['attrs']['cy']) * factor
    const chcx = parseInt(xfrmNode['a:chExt']['attrs']['cx']) * factor
    const chcy = parseInt(xfrmNode['a:chExt']['attrs']['cy']) * factor

    const order = node['attrs']['order']

    let result = `<div class="block group" style="z-index: ${order}; top: ${(y - chy)}px; left: ${(x - chx)}px; width: ${(cx - chcx)}px; height: ${(cy - chcy)}px;">`

    for (let nodeKey in node) {
      if (node[nodeKey].constructor === Array) {
        for (let i = 0; i < node[nodeKey].length; i++) {
          result += await processNodesInSlide(nodeKey, node[nodeKey][i], warpObj)
        }
      } else {
        result += await processNodesInSlide(nodeKey, node[nodeKey] as SimplifiedNode, warpObj)
      }
    }
    result += '</div>'
    return result
  }

  const processGraphicFrameNode = async (node: SimplifiedNode, warpObj: WarpObj): Promise<string> => {
    let result = ''
    const graphicTypeUri = getTextByPathList(node, ['a:graphic', 'a:graphicData', 'attrs', 'uri'])
    switch (graphicTypeUri) {
      case 'http://schemas.openxmlformats.org/drawingml/2006/table':
        result = await genTable(node, warpObj)
        break
      case 'http://schemas.openxmlformats.org/drawingml/2006/chart':
        result = await genChart(node, warpObj)
        break
      case 'http://schemas.openxmlformats.org/drawingml/2006/diagram':
        result = genDiagram(node, warpObj)
        break
      default:
    }
    return result
  }

  const genTable = async (node: SimplifiedNode, warpObj: WarpObj): Promise<string> => {
    const order = node['attrs']['order']
    const tableNode = getTextByPathList(node, ['a:graphic', 'a:graphicData', 'a:tbl'])
    const xfrmNode = getTextByPathList(node, ['p:xfrm'])
    const getTblPr = getTextByPathList(node, ['a:graphic', 'a:graphicData', 'a:tbl', 'a:tblPr'])
    const getColsGrid = getTextByPathList(node, ['a:graphic', 'a:graphicData', 'a:tbl', 'a:tblGrid', 'a:gridCol'])
    let tblDir = ''
    if (getTblPr !== undefined) {
      const isRTL = getTblPr['attrs']['rtl']
      tblDir = isRTL === 1 ? 'dir=rtl' : 'dir=ltr'
    }
    const firstRowAttr = getTblPr['attrs']['firstRow']
    const bandRowAttr = getTblPr['attrs']['bandRow']
    let tableHtml = `<table ${tblDir} style="border-collapse: collapse; ${getPosition(xfrmNode, undefined, undefined) + getSize(xfrmNode, undefined, undefined)} z-index: ${order};">`
    const trNodes = tableNode['a:tr']
    if (trNodes.constructor === Array) {
      for (let i = 0; i < trNodes.length; i++) {
        const rowHeightParam = trNodes[i]['attrs']['h']
        let rowHeight = 0
        let rowsStyl = ''
        if (rowHeightParam !== undefined) {
          rowHeight = (parseInt(rowHeightParam) * 96) / 914400
          rowsStyl += 'height:' + rowHeight + 'px;'
        }
        let thisTblStyle = {};
        const tbleStyleId = getTblPr['a:tableStyleId']
        if (tbleStyleId !== undefined) {
          const tbleStylList = tableStyles['a:tblStyleLst']['a:tblStyle'] || []
          for (let k = 0; k < tbleStylList.length; k++) {
            if (tbleStylList[k]['attrs']['styleId'] === tbleStyleId) {
              thisTblStyle = tbleStylList[k]
            }
          }
        }
        if (i === 0 && firstRowAttr !== undefined) {
          let fillColor = 'fff'
          let colorOpacity = 1
          if (thisTblStyle['a:firstRow'] !== undefined) {
            const bgFillschemeClr = getTextByPathList(thisTblStyle, ['a:firstRow', 'a:tcStyle', 'a:fill', 'a:solidFill'])
            if (bgFillschemeClr !== undefined) {
              fillColor = getSolidFill(bgFillschemeClr) as string
              colorOpacity = getColorOpacity(bgFillschemeClr) as number
            }
            const borderStyl = getTextByPathList(thisTblStyle, ['a:firstRow', 'a:tcStyle', 'a:tcBdr'])
            if (borderStyl !== undefined) {
              const rowBorders = getTableBorders(borderStyl)
              rowsStyl += rowBorders
            }
            const rowTxtStyl = getTextByPathList(thisTblStyle, ['a:firstRow', 'a:tcTxStyle'])
            if (rowTxtStyl !== undefined) { }
          }
          rowsStyl += ` background-color: #${fillColor}; opacity: ${colorOpacity};`
        } else if (i > 0 && bandRowAttr !== undefined) {
          let fillColor = 'fff'
          let colorOpacity = 1
          if (i % 2 === 0) {
            if (thisTblStyle['a:band2H'] !== undefined) {
              const bgFillschemeClr = getTextByPathList(thisTblStyle, ['a:band2H', 'a:tcStyle', 'a:fill', 'a:solidFill'])
              if (bgFillschemeClr !== undefined) {
                fillColor = getSolidFill(bgFillschemeClr) as string
                colorOpacity = getColorOpacity(bgFillschemeClr) as number
              }
              const borderStyl = getTextByPathList(thisTblStyle, ['a:band2H', 'a:tcStyle', 'a:tcBdr'])
              if (borderStyl !== undefined) {
                const rowBorders = getTableBorders(borderStyl)
                rowsStyl += rowBorders
              }
              const rowTxtStyl = getTextByPathList(thisTblStyle, ['a:band2H', 'a:tcTxStyle'])
              if (rowTxtStyl !== undefined) { }
            }
          } else {
            if (thisTblStyle['a:band1H'] !== undefined) {
              const bgFillschemeClr = getTextByPathList(thisTblStyle, ['a:band1H', 'a:tcStyle', 'a:fill', 'a:solidFill'])
              if (bgFillschemeClr !== undefined) {
                fillColor = getSolidFill(bgFillschemeClr) as string
                colorOpacity = getColorOpacity(bgFillschemeClr) as number
              }
              const borderStyl = getTextByPathList(thisTblStyle, ['a:band1H', 'a:tcStyle', 'a:tcBdr'])
              if (borderStyl !== undefined) {
                const rowBorders = getTableBorders(borderStyl)
                rowsStyl += rowBorders
              }
              const rowTxtStyl = getTextByPathList(thisTblStyle, ['a:band1H', 'a:tcTxStyle'])
              if (rowTxtStyl !== undefined) { }
            }
          }
          rowsStyl += ` background-color: #${fillColor}; opacity: ${colorOpacity};`
        }
        tableHtml += `<tr style="${rowsStyl} ">`
        const tcNodes = trNodes[i]['a:tc']
        if (tcNodes.constructor === Array) {
          for (let j = 0; j < tcNodes.length; j++) {
            const text = await genTextBody(tcNodes[j]['a:txBody'], undefined, undefined, undefined, warpObj)
            const rowSpan = getTextByPathList(tcNodes[j], ['attrs', 'rowSpan'])
            const colSpan = getTextByPathList(tcNodes[j], ['attrs', 'gridSpan'])
            const vMerge = getTextByPathList(tcNodes[j], ['attrs', 'vMerge'])
            const hMerge = getTextByPathList(tcNodes[j], ['attrs', 'hMerge'])
            const colWidthParam = getColsGrid[j]['attrs']['w']
            let colStyl = ''
            if (colWidthParam !== undefined) {
              const colWidth = (parseInt(colWidthParam) * 96) / 914400
              colStyl += 'width:' + colWidth + 'px;'
            }
            const getFill = tcNodes[j]["a:tcPr"]["a:solidFill"];
            let fillColor = ''
            let colorOpacity = 1
            if (getFill !== undefined) {
              fillColor = getSolidFill(getFill) as string
              colorOpacity = getColorOpacity(getFill) as number
            } else {
              const tbleStyleId = getTblPr['a:tableStyleId']
              if (tbleStyleId !== undefined) {
                const tbleStylList = tableStyles['a:tblStyleLst']['a:tblStyle'] || []
                for (let k = 0; k < tbleStylList.length; k++) {
                  if (tbleStylList[k]['attrs']['styleId'] === tbleStyleId) {
                    console.log(tbleStylList[k])
                  }
                }
              }
              // console.log(tbleStyleId);
            }
            if (fillColor !== '') {
              colStyl += ` background-color: #${fillColor};`
              console.log('检查一下')
              colStyl += ` opacity: ${colorOpacity};`
            }
            if (rowSpan !== undefined) {
              tableHtml += `<td rowspan="${parseInt(rowSpan)}" style="${colStyl}">${text}</td>`
            } else if (colSpan !== undefined) {
              tableHtml += `<td colspan="${parseInt(colSpan)}" style="${colStyl}">${text}</td>`
            } else if (vMerge === undefined && hMerge === undefined) {
              tableHtml += `<td style="${colStyl}">${text}</td>`
            }
          }
        } else {
          const text = await genTextBody(tcNodes['a:txBody'])
          const colWidthParam = getColsGrid[0]['attrs']['w']
          let colStyl = ''
          if (colWidthParam !== undefined) {
            const colWidth = (parseInt(colWidthParam) * 96) / 914400
            colStyl += `width: ${colWidth}px;`
          }
          const getFill = tcNodes['a:tcPr']['a:solidFill']
          let fillColor = ''
          let colorOpacity = 1
          if (getFill !== undefined) {
            fillColor = getSolidFill(getFill) as string
            colorOpacity = getColorOpacity(getFill) as number
          } else {
            
          }
          if (fillColor !== '') {
            colStyl += ` background-color: #${fillColor};`
            colStyl += ` opacity: ${colorOpacity};`
            console.log('检查一下')
          }
          tableHtml += `<td style="${colStyl}">${text}</td>`
        }
        tableHtml += '</tr>'
      }
    }
    return tableHtml
  }

  const getTableBorders = (node: SimplifiedNode): string => {
    let borderStyle = ''
    let obj: SimplifiedNode
    let borders: string
    if (node['a:bottom'] !== undefined) {
      obj = {
        'p:spPr': {
          'a:ln': node['a:bottom']['a:ln'],
        },
      }
      borders = getBorder(obj, false) as string
      borderStyle += borders.replace('border', 'border-bottom')
    }
    if (node['a:top'] !== undefined) {
      obj = {
        'p:spPr': {
          'a:ln': node['a:top']['a:ln'],
        },
      }
      borders = getBorder(obj, false) as string
      borderStyle += borders.replace('border', 'border-top')
    }
    if (node['a:right'] !== undefined) {
      obj = {
        'p:spPr': {
          'a:ln': node['a:right']['a:ln'],
        },
      }
      borders = getBorder(obj, false) as string
      borderStyle += borders.replace('border', 'border-right')
    }
    if (node['a:left'] !== undefined) {
      obj = {
        'p:spPr': {
          'a:ln': node['a:left']['a:ln'],
        },
      }
      borders = getBorder(obj, false) as string
      borderStyle += borders.replace('border', 'border-left')
    }
    return borderStyle
  }

  const genChart = async (node: SimplifiedNode, warpObj: WarpObj): Promise<string> => {
    const order = node['attrs']['order']
    const xfrmNode = getTextByPathList(node, ['p:xfrm'])
    const result = `<div id="chart${chartID}" class="block content" style="${getPosition(xfrmNode, undefined, undefined) + getSize(xfrmNode, undefined, undefined)} z-index: ${order};"></div>`

    const rid = node['a:graphic']['a:graphicData']['c:chart']['attrs']['r:id']
    const refName = warpObj['slideResObj'][rid]['target']
    const content = await readXmlFile(warpObj['zip'], refName)
    const plotArea = getTextByPathList(content, ['c:chartSpace', 'c:chart', 'c:plotArea'])

    let chartData: ChartData | null = null
    for (let key in plotArea) {
      switch (key) {
        case 'c:lineChart':
          chartData = {
            type: 'createChart',
            data: {
              chartID: 'chart' + chartID,
              chartType: 'lineChart',
              chartData: extractChartData(plotArea[key]['c:ser']),
            },
          }
          break
        case "c:barChart":
          chartData = {
            type: 'createChart',
            data: {
              chartID: 'chart' + chartID,
              chartType: 'barChart',
              chartData: extractChartData(plotArea[key]['c:ser']),
            },
          }
          break
        case 'c:pieChart':
          chartData = {
            type: 'createChart',
            data: {
              chartID: 'chart' + chartID,
              chartType: 'pieChart',
              chartData: extractChartData(plotArea[key]['c:ser']),
            },
          }
          break
        case "c:pie3DChart":
          chartData = {
            type: 'createChart',
            data: {
              chartID: 'chart' + chartID,
              chartType: 'pie3DChart',
              chartData: extractChartData(plotArea[key]['c:ser']),
            },
          }
          break
        case 'c:areaChart':
          chartData = {
            type: 'createChart',
            data: {
              chartID: 'chart' + chartID,
              chartType: 'areaChart',
              chartData: extractChartData(plotArea[key]['c:ser']),
            },
          }
          break
        case 'c:scatterChart':
          chartData = {
            type: 'createChart',
            data: {
              chartID: 'chart' + chartID,
              chartType: 'scatterChart',
              chartData: extractChartData(plotArea[key]['c:ser']),
            },
          }
          break
        case 'c:catAx':
          break
        case 'c:valAx':
          break
        default:
      }
    }
    if (chartData !== null) {
      charts.push(chartData)
    }
    chartID++
    return result
  }

  const extractChartData = (serNode: SimplifiedNode): string | DataMat[] | number[][] => {
    const dataMat: DataMat[] | number[][] = []
    if (serNode === undefined) {
      return dataMat
    }
    if (serNode['c:xVal'] !== undefined) {
      let dataRow: number[] = []
      eachElement(
        serNode['c:xVal']['c:numRef']['c:numCache']['c:pt'],
        (innerNode, index) => {
          dataRow.push(parseFloat(innerNode['c:v'] as string))
          return ''
        }
      );
      (dataMat as number[][]).push(dataRow)
      dataRow = []
      eachElement(
        serNode['c:yVal']['c:numRef']['c:numCache']['c:pt'],
        (innerNode, index) => {
          dataRow.push(parseFloat(innerNode['c:v'] as string))
          return ''
        }
      );
      (dataMat as number[][]).push(dataRow)
    } else {
      eachElement(serNode, (innerNode, index) => {
        const dataRow: { x: number, y: number }[] = []
        const colName = getTextByPathList(innerNode, ['c:tx', 'c:strRef', 'c:strCache', 'c:pt', 'c:v']) || index
        const rowNames = {}
        if (getTextByPathList(innerNode, ['c:cat', 'c:strRef', 'c:strCache', 'c:pt']) !== undefined) {
          eachElement(
            innerNode['c:cat']['c:strRef']['c:strCache']['c:pt'],
            (innerNode, index) => {
              rowNames[innerNode['attrs']['idx']] = innerNode['c:v']
              return ''
            }
          )
        } else if (getTextByPathList(innerNode, ['c:cat', 'c:numRef', 'c:numCache', 'c:pt']) !== undefined) {
          eachElement(
            innerNode['c:cat']['c:numRef']['c:numCache']['c:pt'],
            (innerNode, index) => {
              rowNames[innerNode['attrs']['idx']] = innerNode['c:v']
              return ''
            }
          )
        }

        if (getTextByPathList(innerNode, ['c:val', 'c:numRef', 'c:numCache', 'c:pt']) !== undefined) {
          eachElement(
            innerNode['c:val']['c:numRef']['c:numCache']['c:pt'],
            (innerNode, index) => {
              dataRow.push({ x: innerNode['attrs']['idx'] as number, y: parseFloat(innerNode['c:v'] as string) })
              return ''
            }
          )
        }
        (dataMat as DataMat[]).push({ key: colName, values: dataRow, xlabels: rowNames } as DataMat)
        return ''
      })
    }
    return dataMat
  }

  const eachElement = (node: SimplifiedNode | SimplifiedNode[], doFunction: (innerNode: SimplifiedNode, index: number) => string) => {
    if (node === undefined) {
      return
    }
    let result = ''
    if (node.constructor === Array) {
      const l = node.length
      for (let i = 0; i < l; i++) {
        result += doFunction(node[i], i)
      }
    } else {
      result += doFunction(node as SimplifiedNode, 0)
    }
    return result
  }

  const genDiagram = (node: SimplifiedNode, warpObj: WarpObj): string => {
    const xfrmNode = getTextByPathList(node, ['p:xfrm'])
    return `<div class="block content" style="border: 1px dotted; ${getPosition(xfrmNode, undefined, undefined) + getSize(xfrmNode, undefined, undefined)}">TODO: diagram</div>`
  }

  const processPicNode = async (node: SimplifiedNode, warpObj: WarpObj): Promise<string> => { 
    const order = node['attrs']['order']
    const rid = node['p:blipFill']['a:blip']['attrs']['r:embed']
    const imgName = warpObj['slideResObj'][rid]['target']
    const imgFileExt = extractFileExtension(imgName).toLowerCase()
    const zip = warpObj['zip']
    const imgArrayBuffer = await zip.file(imgName)?.async('arraybuffer')
    let mimeType = ''
    const xfrmNode = node['p:spPr']['a:xfrm']
    const rotate = angleToDegrees(node['p:spPr']['a:xfrm']['attrs']['rot'])
    mimeType = getImageMimeType(imgFileExt as string)
    return `<div class="block content" style="${getPosition(xfrmNode, undefined, undefined) + getSize(xfrmNode, undefined, undefined)} z-index: ${order}; transform: rotate(${rotate}deg);">
      <img src="data:${mimeType};base64,${base64ArrayBuffer(imgArrayBuffer as ArrayBuffer)}" style="width: 100%; height: 100%"/>
    </div>`
  }

  const extractFileExtension = (filename: string): ImageSuffix => {
    const dot = filename.lastIndexOf('.');
    if (dot === 0 || dot === -1) return ''
    return filename.substring(filename.lastIndexOf('.') + 1)
  }

  const processCxnSpNode = async (node: SimplifiedNode, warpObj: WarpObj): Promise<string> => {
    const id = node['p:nvCxnSpPr']['p:cNvPr']['attrs']['id']
    const name = node['p:nvCxnSpPr']['p:cNvPr']['attrs']['name']
    const order = node['attrs']['order']
    return await genShape(node, undefined, undefined, id, name, undefined, undefined, order, warpObj)
  }

  const processSpNode = async (node: SimplifiedNode, warpObj: WarpObj): Promise<string> => { 
    /*
     *  958    <xsd:complexType name="CT_GvmlShape">
     *  959   <xsd:sequence>
     *  960     <xsd:element name="nvSpPr" type="CT_GvmlShapeNonVisual"     minOccurs="1" maxOccurs="1"/>
     *  961     <xsd:element name="spPr"   type="CT_ShapeProperties"        minOccurs="1" maxOccurs="1"/>
     *  962     <xsd:element name="txSp"   type="CT_GvmlTextShape"          minOccurs="0" maxOccurs="1"/>
     *  963     <xsd:element name="style"  type="CT_ShapeStyle"             minOccurs="0" maxOccurs="1"/>
     *  964     <xsd:element name="extLst" type="CT_OfficeArtExtensionList" minOccurs="0" maxOccurs="1"/>
     *  965   </xsd:sequence>
     *  966 </xsd:complexType>
     */
    const id = node['p:nvSpPr']['p:cNvPr']['attrs']['id']
    const name = node['p:nvSpPr']['p:cNvPr']['attrs']['name']
    const idx = node['p:nvSpPr']['p:nvPr']['p:ph'] === undefined ? undefined : node['p:nvSpPr']['p:nvPr']['p:ph']['attrs']['idx']
    let type = node['p:nvSpPr']['p:nvPr']['p:ph'] === undefined ? undefined : node['p:nvSpPr']['p:nvPr']['p:ph']['attrs']['type']
    const order = node['attrs']['order']
    let slideLayoutSpNode: SimplifiedNode | string | undefined
    let slideMasterSpNode: SimplifiedNode | string | undefined
    if (type !== undefined) {
      if (idx !== undefined) {
        slideLayoutSpNode = warpObj['slideLayoutTables']['typeTable'][type]
        slideMasterSpNode = warpObj['slideLayoutTables']["typeTable"][type]
      } else {
        slideLayoutSpNode = warpObj['slideLayoutTables']['typeTable'][type]
        slideMasterSpNode = warpObj['slideMasterTables']['typeTable'][type]
      }
    } else {
      if (idx !== undefined) {
        slideLayoutSpNode = warpObj['slideLayoutTables']['idxTable'][idx]
        slideMasterSpNode = warpObj['slideMasterTables']['idxTable'][idx]
      } else {
        
      }
    }
    if (type === undefined) {
      type = getTextByPathList(slideLayoutSpNode, ['p:nvSpPr', 'p:nvPr', 'p:ph', 'attrs', 'type'])
      if (type === undefined) {
        type = getTextByPathList(slideMasterSpNode, ['p:nvSpPr', 'p:nvPr', 'p:ph', 'attrs', 'type'])
      }
    }
    return await genShape(node, slideLayoutSpNode as SimplifiedNode, slideMasterSpNode as SimplifiedNode, id, name, idx, type, order, warpObj)
  }

  const genShape = async (node: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode, id?: number | string, name?: string, idx?: number, type?: string, order?: number | string, warpObj?: WarpObj): Promise<string> => {
    const xfrmList = ['p:spPr', 'a:xfrm']
    const slideXfrmNode = getTextByPathList(node, xfrmList) as SimplifiedNode
    const slideLayoutXfrmNode = getTextByPathList(slideLayoutSpNode, xfrmList)
    const slideMasterXfrmNode = getTextByPathList(slideMasterSpNode, xfrmList)
    let result = ''
    const shpId = getTextByPathList(node, ['attrs', 'order']) as string
    const shapType = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'attrs', 'prst'])
    const custShapType = getTextByPathList(node, ['p:spPr', 'a:custGeom'])
    let isFlipV = false
    if (getTextByPathList(slideXfrmNode, ['attrs', 'flipV']) === '1' || getTextByPathList(slideXfrmNode, ['attrs', 'flipH']) === '1') {
      isFlipV = true
    }
    const rotate = angleToDegrees(getTextByPathList(slideXfrmNode, ['attrs', 'rot']) as string)
    let w: number | undefined
    let h: number | undefined
    let border: string | Border | undefined
    let headEndNodeAttrs: Record<string, any> | undefined
    let tailEndNodeAttrs: Record<string, any> | undefined
    let fillColor: string | GradientFill | undefined
    let grndFillFlg = false
    let imgFillFlg = false
    if (shapType !== undefined || custShapType !== undefined) { 
      const ext = getTextByPathList(slideXfrmNode, ['a:ext', 'attrs']) as SimplifiedNode
      w = (parseInt(ext['cx'] as string) * 96) / 914400
      h = (parseInt(ext['cy'] as string) * 96) / 914400
      result += `<svg class="drawing" _id="${id}" _idx="${idx}" _type="${type}" Name="${name}" style="${getPosition(slideXfrmNode, undefined, undefined) + getSize(slideXfrmNode, undefined, undefined)} z-index: ${order}; transform: rotate(${rotate}deg);">`
      result += '<defs>'
      fillColor = await getShapeFill(node, true, warpObj as WarpObj)
      const clrFillType = getFillType(getTextByPathList(node, ['p:spPr']) as (string | SimplifiedNode))
      if (clrFillType === 'GRADIENT_FILL') {
        grndFillFlg = true
        const colorArray = (fillColor as GradientFill).color
        const angl = (fillColor as GradientFill).rot
        const svgGrdnt = getSvgGradient(w, h, angl, colorArray, shpId)
        result += svgGrdnt
      } else if (clrFillType === 'PIC_FILL') {
        imgFillFlg = true
        const svgBgImg = getSvgImagePattern(fillColor as string, shpId)
        result += svgBgImg
      }
      border = getBorder(node, true) as Border
      headEndNodeAttrs = getTextByPathList(node, ['p:spPr', 'a:ln', 'a:headEnd', 'attrs'])
      tailEndNodeAttrs = getTextByPathList(node, ['p:spPr', 'a:ln', 'a:tailEnd', 'attrs'])
      if ((headEndNodeAttrs !== undefined && (headEndNodeAttrs['type'] === 'triangle' || headEndNodeAttrs['type'] === 'arrow')) ||
        (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs['type'] === 'triangle' || tailEndNodeAttrs['type'] === 'arrow'))) {
        const triangleMarker = `<marker id='markerTriangle_${shpId}' viewBox='0 0 10 10' refX='1' refY='5' markerWidth='5' markerHeight='5' stroke='${border.color}' fill='${border.color}' orient='auto-start-reverse' markerUnits='strokeWidth'><path d='M 0 0 L 10 5 L 0 10 z' /></marker>`
        result += triangleMarker
      }
      result += '</defs>'
    }
    if (shapType !== undefined && custShapType === undefined) {
      switch (shapType) {
        case 'accentBorderCallout1':
        case 'accentBorderCallout2':
        case 'accentBorderCallout3':
        case 'accentCallout1':
        case 'accentCallout2':
        case 'accentCallout3':
        case 'actionButtonBackPrevious':
        case 'actionButtonBeginning':
        case 'actionButtonBlank':
        case 'actionButtonDocument':
        case 'actionButtonEnd':
        case 'actionButtonForwardNext':
        case 'actionButtonHelp':
        case 'actionButtonHome':
        case 'actionButtonInformation':
        case 'actionButtonMovie':
        case 'actionButtonReturn':
        case 'actionButtonSound':
        case 'arc':
        case 'bevel':
        case 'blockArc':
        case 'borderCallout1':
        case 'borderCallout2':
        case 'borderCallout3':
        case 'bracePair':
        case 'bracketPair':
        case 'callout1':
        case 'callout2':
        case 'callout3':
        case 'can':
        case 'chartPlus':
        case 'chartStar':
        case 'chartX':
        case 'chevron':
        case 'chord':
        case 'cloud':
        case 'cloudCallout':
        case 'corner':
        case 'cornerTabs':
        case 'cube':
        case 'diagStripe':
        case 'donut':
        case 'doubleWave':
        case 'downArrowCallout':
        case 'ellipseRibbon':
        case 'ellipseRibbon2':
        case 'flowChartAlternateProcess':
        case 'flowChartCollate':
        case 'flowChartConnector':
        case 'flowChartDecision':
        case 'flowChartDelay':
        case 'flowChartDisplay':
        case 'flowChartDocument':
        case 'flowChartExtract':
        case 'flowChartInputOutput':
        case 'flowChartInternalStorage':
        case 'flowChartMagneticDisk':
        case 'flowChartMagneticDrum':
        case 'flowChartMagneticTape':
        case 'flowChartManualInput':
        case 'flowChartManualOperation':
        case 'flowChartMerge':
        case 'flowChartMultidocument':
        case 'flowChartOfflineStorage':
        case 'flowChartOffpageConnector':
        case 'flowChartOnlineStorage':
        case 'flowChartOr':
        case 'flowChartPredefinedProcess':
        case 'flowChartPreparation':
        case 'flowChartProcess':
        case 'flowChartPunchedCard':
        case 'flowChartPunchedTape':
        case 'flowChartSort':
        case 'flowChartSummingJunction':
        case 'flowChartTerminator':
        case 'folderCorner':
        case 'frame':
        case 'funnel':
        case 'gear6':
        case 'gear9':
        case 'halfFrame':
        case 'heart':
        case 'homePlate':
        case 'horizontalScroll':
        case 'irregularSeal1':
        case 'irregularSeal2':
        case 'leftArrowCallout':
        case 'leftBrace':
        case 'leftBracket':
        case 'leftRightArrowCallout':
        case 'leftRightRibbon':
        case 'lightningBolt':
        case 'lineInv':
        case 'mathDivide':
        case 'mathEqual':
        case 'mathMinus':
        case 'mathMultiply':
        case 'mathNotEqual':
        case 'mathPlus':
        case 'moon':
        case 'nonIsoscelesTrapezoid':
        case 'noSmoking':
        case 'pie':
        case 'pieWedge':
        case 'plaque':
        case 'plaqueTabs':
        case 'quadArrowCallout':
        case 'rect':
        case 'ribbon':
        case 'ribbon2':
        case 'rightArrowCallout':
        case 'rightBrace':
        case 'rightBracket':
        case 'round1Rect':
        case 'round2DiagRect':
        case 'round2SameRect':
        case 'smileyFace':
        case 'snip1Rect':
        case 'snip2DiagRect':
        case 'snip2SameRect':
        case 'snipRoundRect':
        case 'squareTabs':
        case 'star10':
        case 'star12':
        case 'star16':
        case 'star24':
        case 'star32':
        case 'star4':
        case 'star5':
        case 'star6':
        case 'star7':
        case 'star8':
        case 'sun':
        case 'teardrop':
        case 'upArrowCallout':
        case 'upDownArrowCallout':
        case 'verticalScroll':
        case 'wave':
        case 'wedgeEllipseCallout':
        case 'wedgeRectCallout':
        case 'wedgeRoundRectCallout': {
          result += `<rect x='0' y='0' width='${w}' height='${h}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'ellipse': {
          result += `<ellipse cx='${(w as number) / 2}' cy='${(h as number) / 2}' rx='${(w as number) / 2}' ry='${(h as number) / 2}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')} ' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'roundRect': {
          result += `<rect x='0' y='0' width='${w}' height='${h}' rx='7' ry='7' fill='${(!imgFillFlg ? grndFillFlg ? "url(#linGrd_" + shpId + ")" : fillColor : "url(#imgPtrn_" + shpId + ")")}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'bentConnector2': {
          let d: string
          if (isFlipV) {
            d = `M 0 ${w} L ${h} ${w} L ${h} 0`
          } else {
            d = `M ${w} 0 L ${w} ${h} L 0 ${h}`
          }
          result += `<path d='${d}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' fill='none' `
          if (headEndNodeAttrs !== undefined && (headEndNodeAttrs['type'] === 'triangle' || headEndNodeAttrs['type'] === 'arrow')) {
            result += `marker-start='url(#markerTriangle_${shpId})' `
          }
          if (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs['type'] === 'triangle' || tailEndNodeAttrs['type'] === 'arrow')) {
            result += `marker-end='url(#markerTriangle_${shpId})' `
          }
          result += `/>`
          break
        }
        case 'rtTriangle': {
          result += ` <polygon points='0 0,0 ${h},${w} ${h}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'triangle': {
          const shapAdjst = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd', 'attrs', 'fmla'])
          let shapAdjstVal = 0.5
          if (shapAdjst !== undefined) {
            shapAdjstVal = (parseInt(shapAdjst.substr(4)) * 96) / 9144000
          }
          result += ` <polygon points='${(w as number) * shapAdjstVal} 0,0 ${h},${w} ${h}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'diamond': {
          result += ` <polygon points='${(w as number) / 2} 0,0 ${(h as number) / 2},${(w as number) / 2} ${h},${w} ${(h as number) / 2}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'trapezoid': {
          const shapAdjst = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd', 'attrs', 'fmla'])
          let adjstVal = 0.25
          const maxAdjConst = 0.7407
          if (shapAdjst !== undefined) {
            const adjst = (parseInt(shapAdjst.substr(4)) * 96) / 9144000
            adjstVal = (adjst * 0.5) / maxAdjConst
          }
          result += ` <polygon points=\'${(w as number) * adjstVal} 0,0 ${h},${w} ${h},${(1 - adjstVal) * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'parallelogram': {
          const shapAdjst = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd', 'attrs', 'fmla'])
          let adjstVal = 0.25
          let maxAdjConst
          if ((w as number) > (h as number)) {
            maxAdjConst = (w as number) / (h as number)
          } else {
            maxAdjConst = (h as number) / (w as number)
          }
          if (shapAdjst !== undefined) {
            const adjst = parseInt(shapAdjst.substr(4)) / 100000
            adjstVal = adjst / maxAdjConst
          }
          result += ` <polygon points='${adjstVal * (w as number)} 0,0 ${h},${(1 - adjstVal) * (w as number)} ${h},${w} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'pentagon': {
          result += ` <polygon points='${0.5 * (w as number)} 0,0 ${0.375 * (h as number)},${0.15 * (w as number)} ${h},${0.85 * (w as number)} ${h},${w} ${0.375 * (h as number)}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'hexagon': {
          const shapAdjstArray = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd']) || []
          let shapAdjst
          for (let i = 0; i < shapAdjstArray.length; i++) {
            if (
              getTextByPathList(shapAdjstArray[i], ['attrs', 'name']) === 'adj'
            ) {
              shapAdjst = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
            }
          }
          let adjstVal = 0.25
          const maxAdjConst = 0.62211
          if (shapAdjst !== undefined) {
            const adjst = (parseInt(shapAdjst.substr(4)) * 96) / 9144000
            adjstVal = (adjst * 0.5) / maxAdjConst
          }
          result += ` <polygon points='${(w as number) * adjstVal} 0,0 ${(h as number) / 2},${(w as number) * adjstVal} ${h},${(1 - adjstVal) * (w as number)} ${h},${w} ${(h as number) / 2},${(1 - adjstVal) * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'heptagon': {
          result += ` <polygon points='${0.5 * (w as number)} 0,${(w as number) / 8} ${(h as number) / 4},0 ${(5 / 8) * (h as number)},${(w as number) / 4} ${h},${(3 / 4) * (w as number)} ${h},${w} ${(5 / 8) * (h as number)},${(7 / 8) * (w as number)} ${(h as number) / 4}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'octagon': {
          const shapAdjst = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd', 'attrs', 'fmla'])
          let adj1 = 0.25
          if (shapAdjst !== undefined) {
            adj1 = parseInt(shapAdjst.substr(4)) / 100000
          }
          const adj2 = 1 - adj1
          result += ` <polygon points='${adj1 * (w as number)} 0,0 ${adj1 * (h as number)},0 ${adj2 * (h as number)},${adj1 * (w as number)} ${h},${adj2 * (w as number)} ${h},${w} ${adj2 * (h as number)},${w} ${adj1 * (h as number)},${adj2 * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'decagon': {
          result += ` <polygon points='${(3 / 8) * (w as number)} 0,${(w as number) / 8} ${(h as number) / 8},0 ${(h as number) / 2},${(w as number) / 8} ${(7 / 8) * (h as number)},${(3 / 8) * (w as number)} ${h},${(5 / 8) * (w as number)} ${h},${(7 / 8) * (w as number)} ${(7 / 8) * (h as number)},${w} ${(h as number) / 2},${(7 / 8) * (w as number)} ${(h as number) / 8},${(5 / 8) * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'dodecagon': {
          result += ` <polygon points='${(3 / 8) * (w as number)} 0,${(w as number) / 8} ${(h as number) / 8},0 ${(3 / 8) * (h as number)},0 ${(5 / 8) * (h as number)},${(w as number) / 8} ${(7 / 8) * (h as number)},${(3 / 8) * (w as number)} ${h},${(5 / 8) * (w as number)} ${h},${(7 / 8) * (w as number)} ${(7 / 8) * (h as number)},${w} ${(5 / 8) * (h as number)},${w} ${(3 / 8) * (h as number)},${(7 / 8) * (w as number)} ${(h as number) / 8},${(5 / 8) * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'bentConnector3': {
          const shapAdjst = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd', 'attrs', 'fmla'])
          let shapAdjstVal = 0.5
          if (shapAdjst !== undefined) {
            shapAdjstVal = parseInt(shapAdjst.substr(4)) / 100000
            if (isFlipV) {
              result += ` <polyline points='${w} 0,${(1 - shapAdjstVal) * (w as number)} 0,${(1 - shapAdjstVal) * (w as number)} ${h},0 ${h}' fill='transparent' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' `
            } else {
              result += ` <polyline points='0 0,${shapAdjstVal * (w as number)} 0,${shapAdjstVal * (w as number)} ${h},${w} ${h}' fill='transparent' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' `
            }
            if (headEndNodeAttrs !== undefined && (headEndNodeAttrs["type"] === "triangle" || headEndNodeAttrs["type"] === "arrow")) {
              result += `marker-start='url(#markerTriangle_${shpId})' `
            }
            if (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs['type'] === 'triangle' || tailEndNodeAttrs['type'] === 'arrow')) {
              result += `marker-end='url(#markerTriangle_${shpId})' `
            }
            result += '/>'
          }
          break
        }
        case 'plus': {
          const shapAdjst = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd', 'attrs', 'fmla'])
          let adj1 = 0.25
          if (shapAdjst !== undefined) {
            adj1 = parseInt(shapAdjst.substr(4)) / 100000
          }
          const adj2 = 1 - adj1
          result += ` <polygon points='${adj1 * (w as number)} 0,${adj1 * (w as number)} ${adj1 * (h as number)},0 ${adj1 * (h as number)},0 ${adj2 * (h as number)},${adj1 * (w as number)} ${adj2 * (h as number)},${adj1 * (w as number)} ${h},${adj2 * (w as number)} ${h},${adj2 * (w as number)} ${adj2 * (h as number)},${w} ${adj2 * (h as number)},${+(w as number)} ${adj1 * (h as number)},${adj2 * (w as number)} ${adj1 * (h as number)},${adj2 * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'line':
        case 'straightConnector1':
        case 'bentConnector4':
        case 'bentConnector5':
        case 'curvedConnector2':
        case 'curvedConnector3':
        case 'curvedConnector4':
        case 'curvedConnector5': {
          if (isFlipV) {
            result += `<line x1='${w}' y1='0' x2='0' y2='${h}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' `
          } else {
            result += `<line x1='0' y1='0' x2='${w}' y2='${h}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' `
          }
          if (headEndNodeAttrs !== undefined && (headEndNodeAttrs['type'] === 'triangle' || headEndNodeAttrs['type'] === 'arrow')) {
            result += `marker-start='url(#markerTriangle_${shpId})' `
          }
          if (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs['type'] === 'triangle' || tailEndNodeAttrs['type'] === 'arrow')) {
            result += `marker-end='url(#markerTriangle_${shpId})' `
          }
          result += '/>'
          break
        }
        case 'rightArrow': {
          const shapAdjstArray = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd'])
          let sAdj1: string
          let sAdj1Val = 0.5
          let sAdj2: string
          let sAdj2Val = 0.5
          const maxSAdj2Const = (w as number) / (h as number)
          if (shapAdjstArray !== undefined) {
            for (let i = 0; i < shapAdjstArray.length; i++) {
              const sAdjName = getTextByPathList(shapAdjstArray[i], ['attrs', 'name'])
              if (sAdjName === 'adj1') {
                sAdj1 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                sAdj1Val = 0.5 - parseInt(sAdj1.substring(4)) / 200000
              } else if (sAdjName === 'adj2') {
                sAdj2 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                const sAdj2Val2 = parseInt(sAdj2.substring(4)) / 100000
                sAdj2Val = 1 - sAdj2Val2 / maxSAdj2Const
              }
            }
          }
          result += ` <polygon points='${w} ${(h as number) / 2},${sAdj2Val * (w as number)} 0,${sAdj2Val * (w as number)} ${sAdj1Val * (h as number)},0 ${sAdj1Val * (h as number)},0 ${(1 - sAdj1Val) * (h as number)},${sAdj2Val * (w as number)} ${(1 - sAdj1Val) * (h as number)}, ${sAdj2Val * (w as number)} ${h}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'leftArrow': {
          const shapAdjstArray = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd'])
          let sAdj1: string
          let sAdj1Val = 0.5
          let sAdj2: string
          let sAdj2Val = 0.5
          const maxSAdj2Const = (w as number) / (h as number)
          if (shapAdjstArray !== undefined) {
            for (let i = 0; i < shapAdjstArray.length; i++) {
              const sAdjName = getTextByPathList(shapAdjstArray[i], ['attrs', 'name'])
              if (sAdjName === 'adj1') {
                sAdj1 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                sAdj1Val = 0.5 - parseInt(sAdj1.substring(4)) / 200000
              } else if (sAdjName === 'adj2') {
                sAdj2 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                const sAdj2Val2 = parseInt(sAdj2.substring(4)) / 100000
                sAdj2Val = sAdj2Val2 / maxSAdj2Const;
              }
            }
          }
          result += ` <polygon points='0 ${(h as number) / 2},${sAdj2Val * (w as number)} ${h},${sAdj2Val * (w as number)} ${(1 - sAdj1Val) * (h as number)},${w} ${(1 - sAdj1Val) * (h as number)},${w} ${sAdj1Val * (h as number)},${sAdj2Val * (w as number)} ${sAdj1Val * (h as number)}, ${sAdj2Val * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'downArrow': {
          const shapAdjstArray = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd'])
          let sAdj1: string
          let sAdj1Val = 0.5
          let sAdj2: string
          let sAdj2Val = 0.5
          const maxSAdj2Const = (h as number) / (w as number)
          if (shapAdjstArray !== undefined) {
            for (let i = 0; i < shapAdjstArray.length; i++) {
              const sAdjName = getTextByPathList(shapAdjstArray[i], ['attrs', 'name'])
              if (sAdjName === 'adj1') {
                sAdj1 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                sAdj1Val = parseInt(sAdj1.substring(4)) / 200000
              } else if (sAdjName === 'adj2') {
                sAdj2 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                const sAdj2Val2 = parseInt(sAdj2.substring(4)) / 100000
                sAdj2Val = sAdj2Val2 / maxSAdj2Const
              }
            }
          }
          result += ` <polygon points='${(0.5 - sAdj1Val) * (w as number)} 0,${(0.5 - sAdj1Val) * (w as number)} ${(1 - sAdj2Val) * (h as number)},0 ${(1 - sAdj2Val) * (h as number)},${(w as number) / 2} ${h},${w} ${(1 - sAdj2Val) * (h as number)},${(0.5 + sAdj1Val) * (w as number)} ${(1 - sAdj2Val) * (h as number)}, ${(0.5 + sAdj1Val) * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'upArrow': {
          const shapAdjstArray = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd'])
          let sAdj1: string
          let sAdj1Val = 0.5
          let sAdj2: string
          let sAdj2Val = 0.5
          const maxSAdj2Const = (h as number) / (w as number)
          if (shapAdjstArray !== undefined) {
            for (let i = 0; i < shapAdjstArray.length; i++) {
              const sAdjName = getTextByPathList(shapAdjstArray[i], ['attrs', 'name'])
              if (sAdjName === 'adj1') {
                sAdj1 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                sAdj1Val = parseInt(sAdj1.substring(4)) / 200000
              } else if (sAdjName === 'adj2') {
                sAdj2 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                const sAdj2Val2 = parseInt(sAdj2.substring(4)) / 100000
                sAdj2Val = sAdj2Val2 / maxSAdj2Const
              }
            }
          }
          result += ` <polygon points='${(w as number) / 2} 0,0 ${sAdj2Val * (h as number)},${(0.5 - sAdj1Val) * (w as number)} ${sAdj2Val * (h as number)},${(0.5 - sAdj1Val) * (w as number)} ${h},${(0.5 + sAdj1Val) * (w as number)} ${h},${(0.5 + sAdj1Val) * (w as number)} ${sAdj2Val * (h as number)}, ${w} ${sAdj2Val * (h as number)}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'leftRightArrow': {
          const shapAdjstArray = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd'])
          let sAdj1: string
          let sAdj1Val = 0.5
          let sAdj2: string
          let sAdj2Val = 0.5
          const maxSAdj2Const = (w as number) / (h as number)
          if (shapAdjstArray !== undefined) {
            for (let i = 0; i < shapAdjstArray.length; i++) {
              const sAdjName = getTextByPathList(shapAdjstArray[i], ['attrs', 'name'])
              if (sAdjName === 'adj1') {
                sAdj1 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                sAdj1Val = 0.5 - parseInt(sAdj1.substring(4)) / 200000
              } else if (sAdjName === 'adj2') {
                sAdj2 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                const sAdj2Val2 = parseInt(sAdj2.substring(4)) / 100000
                sAdj2Val = sAdj2Val2 / maxSAdj2Const
              }
            }
          }
          result += ` <polygon points='0 ${(h as number) / 2},${sAdj2Val * (w as number)} ${h},${sAdj2Val * (w as number)} ${(1 - sAdj1Val) * (h as number)},${(1 - sAdj2Val) * (w as number)} ${(1 - sAdj1Val) * (h as number)},${(1 - sAdj2Val) * (w as number)} ${h},${w} ${(h as number) / 2}, ${(1 - sAdj2Val) * (w as number)} 0,${(1 - sAdj2Val) * (w as number)} ${sAdj1Val * (h as number)},${sAdj2Val * (w as number)} ${sAdj1Val * (h as number)},${sAdj2Val * (w as number)} 0' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'upDownArrow': {
          const shapAdjstArray = getTextByPathList(node, ['p:spPr', 'a:prstGeom', 'a:avLst', 'a:gd'])
          let sAdj1: string
          let sAdj1Val = 0.5
          let sAdj2: string
          let sAdj2Val = 0.5
          const maxSAdj2Const = (h as number) / (w as number)
          if (shapAdjstArray !== undefined) {
            for (let i = 0; i < shapAdjstArray.length; i++) {
              const sAdjName = getTextByPathList(shapAdjstArray[i], ['attrs', 'name'])
              if (sAdjName === 'adj1') {
                sAdj1 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                sAdj1Val = 0.5 - parseInt(sAdj1.substring(4)) / 200000
              } else if (sAdjName === 'adj2') {
                sAdj2 = getTextByPathList(shapAdjstArray[i], ['attrs', 'fmla'])
                const sAdj2Val2 = parseInt(sAdj2.substring(4)) / 100000
                sAdj2Val = sAdj2Val2 / maxSAdj2Const
              }
            }
          }
          result += ` <polygon points='${(w as number) / 2} 0,0 ${sAdj2Val * (h as number)},${sAdj1Val * (w as number)} ${sAdj2Val * (h as number)},${sAdj1Val * (w as number)} ${(1 - sAdj2Val) * (h as number)},0 ${(1 - sAdj2Val) * (h as number)},${(w as number) / 2} ${h}, ${w} ${(1 - sAdj2Val) * (h as number)},${(1 - sAdj1Val) * (w as number)} ${(1 - sAdj2Val) * (h as number)},${(1 - sAdj1Val) * (w as number)} ${sAdj2Val * (h as number)},${w} ${sAdj2Val * (h as number)}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' />`
          break
        }
        case 'bentArrow':
        case 'bentUpArrow':
        case 'stripedRightArrow':
        case 'quadArrow':
        case 'circularArrow':
        case 'swooshArrow':
        case 'leftRightUpArrow':
        case 'leftUpArrow':
        case 'leftCircularArrow':
        case 'notchedRightArrow':
        case 'curvedDownArrow':
        case 'curvedLeftArrow':
        case 'curvedRightArrow':
        case 'curvedUpArrow':
        case 'uturnArrow':
        case 'leftRightCircularArrow':
          break
        case undefined:
        default:
          console.warn('Undefine shape type.')
      }
      result += '</svg>'
      result += `<div class="block content ${getVerticalAlign(node, slideLayoutSpNode as SimplifiedNode, slideMasterSpNode as SimplifiedNode, type as string)}" _id="${id}" _idx="${idx}" _type="${type}" Name="${name}" style="${getPosition(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) + getSize(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode)} z-index: ${order}; transform: rotate(${rotate}deg);">`
      if (node['p:txBody'] !== undefined) {
        result += await genTextBody(node['p:txBody'] as SimplifiedNode, slideLayoutSpNode as SimplifiedNode, slideMasterSpNode as SimplifiedNode, type as string, warpObj as WarpObj)
      }
      result += '</div>'
    } else if (custShapType !== undefined) {
      const pathLstNode = getTextByPathList(custShapType, ['a:pathLst'])
      const closeNode = getTextByPathList(pathLstNode, ['a:path', 'a:close'])
      const startPoint = getTextByPathList(pathLstNode, ['a:path', 'a:moveTo', 'a:pt', 'attrs']) || { x: '0', y: '0' }
      const spX = (parseInt(startPoint['x']) * 96) / 914400
      const spY = (parseInt(startPoint['y']) * 96) / 914400
      let d = 'M' + spX + ',' + spY
      const pathNodes = getTextByPathList(pathLstNode, ['a:path'])
      const lnToNodes = pathNodes['a:lnTo']
      const cubicBezToNodes = pathNodes['a:cubicBezTo']
      const sortblAry: PtObj[] = []
      if (lnToNodes !== undefined) {
        Object.keys(lnToNodes).forEach((key) => {
          const lnToPtNode = lnToNodes[key]['a:pt']
          if (lnToPtNode !== undefined) {
            Object.keys(lnToPtNode).forEach((key2) => {
              const ptObj: PtObj = { type: '', order: 0, x: '', y: '' }
              const lnToNoPt = lnToPtNode[key2]
              const ptX = lnToNoPt['x']
              const ptY = lnToNoPt['y']
              const ptOrdr = lnToNoPt['order']
              ptObj.type = 'lnto'
              ptObj.order = ptOrdr
              ptObj.x = ptX
              ptObj.y = ptY
              sortblAry.push(ptObj)
            })
          }
        })
      }
      if (cubicBezToNodes !== undefined) {
        Object.keys(cubicBezToNodes).forEach((key) => {
          const cubicBezToPtNodes = cubicBezToNodes[key]['a:pt']
          if (cubicBezToPtNodes !== undefined) {
            Object.keys(cubicBezToPtNodes).forEach((key2) => {
              const cubBzPts = cubicBezToPtNodes[key2]
              Object.keys(cubBzPts).forEach((key3) => {
                const ptObj: PtObj = { type: '', order: 0, x: '', y: '' }
                const cubBzPt = cubBzPts[key3]
                const ptX = cubBzPt['x']
                const ptY = cubBzPt['y']
                const ptOrdr = cubBzPt['order']
                ptObj.type = 'cubicBezTo'
                ptObj.order = ptOrdr
                ptObj.x = ptX
                ptObj.y = ptY
                sortblAry.push(ptObj)
              })
            })
          }
        })
      }
      const sortByOrder = sortblAry.slice(0)
      sortByOrder.sort((a, b) => {
        return a.order - b.order
      })
      let k = 0
      while (k < sortByOrder.length) {
        if (sortByOrder[k].type === 'lnto') {
          const Lx = (parseInt(sortByOrder[k].x) * 96) / 914400
          const Ly = (parseInt(sortByOrder[k].y) * 96) / 914400
          d += 'L' + Lx + ',' + Ly
          k++
        } else {
          const Cx1 = (parseInt(sortByOrder[k].x) * 96) / 914400
          const Cy1 = (parseInt(sortByOrder[k].y) * 96) / 914400
          const Cx2 = (parseInt(sortByOrder[k + 1].x) * 96) / 914400
          const Cy2 = (parseInt(sortByOrder[k + 1].y) * 96) / 914400
          const Cx3 = (parseInt(sortByOrder[k + 2].x) * 96) / 914400
          const Cy3 = (parseInt(sortByOrder[k + 2].y) * 96) / 914400
          d += 'C' + Cx1 + ',' + Cy1 + ' ' + Cx2 + ',' + Cy2 + ' ' + Cx3 + ',' + Cy3
          k += 3
        }
      }
      result += `<path d='${d}' fill='${(!imgFillFlg ? grndFillFlg ? 'url(#linGrd_' + shpId + ')' : fillColor : 'url(#imgPtrn_' + shpId + ')')}' stroke='${(border as Border).color}' stroke-width='${(border as Border).width}' stroke-dasharray='${(border as Border).strokeDasharray}' `
      if (closeNode !== undefined) {
        result += '/>'
      } else {
        if (headEndNodeAttrs !== undefined && (headEndNodeAttrs['type'] === 'triangle' || headEndNodeAttrs['type'] === 'arrow')) {
          result += `marker-start='url(#markerTriangle_${shpId})' `
        }
        if (tailEndNodeAttrs !== undefined && (tailEndNodeAttrs['type'] === 'triangle' || tailEndNodeAttrs['type'] === 'arrow')) {
          result += `marker-end='url(#markerTriangle_${shpId})' `
        }
        result += '/>'
      }
      result += '</svg>'
      result += `<div class="block content ${getVerticalAlign(node, slideLayoutSpNode as SimplifiedNode, slideMasterSpNode as SimplifiedNode, type as string)}" _id="${id}" _idx="${idx}" _type="${type}" Name="${name}" style="${getPosition(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) + getSize(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode)} z-index: ${order}; transform: rotate(${rotate}deg);">`
      if (node['p:txBody'] !== undefined) {
        result += await genTextBody(node['p:txBody'] as SimplifiedNode, slideLayoutSpNode as SimplifiedNode, slideMasterSpNode as SimplifiedNode, type as string, warpObj as WarpObj)
      }
      result += '</div>'
    } else { 
      result += `<div class="block content ${getVerticalAlign(node, slideLayoutSpNode as SimplifiedNode, slideMasterSpNode as SimplifiedNode, type as string)}" _id="${id}" _idx="${idx}" _type="${type}" Name="${name}" style="${getPosition(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) + getSize(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode) + getBorder(node, false) + (await getShapeFill(node, false, warpObj as WarpObj))} z-index: ${order}; transform: rotate(${rotate}deg);">`
      if (node['p:txBody'] !== undefined) {
        result += await genTextBody(node['p:txBody'] as SimplifiedNode, slideLayoutSpNode as SimplifiedNode, slideMasterSpNode as SimplifiedNode, type as string, warpObj as WarpObj)
      }
      result += '</div>'
    }
    return result
  }

  const genTextBody = async (textBodyNode: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode, type?: string, warpObj?: WarpObj): Promise<string> => {
    let text = ''
    const slideMasterTextStyles = (warpObj as WarpObj)['slideMasterTextStyles']
    if (textBodyNode === undefined) {
      return text
    }
    let pNode: SimplifiedNode
    let rNode: SimplifiedNode
    if (textBodyNode['a:p'].constructor === Array) {
      for (let i = 0; i < textBodyNode['a:p'].length; i++) {
        pNode = textBodyNode['a:p'][i]
        rNode = pNode["a:r"] as SimplifiedNode
        text += '<div  class="' + getHorizontalAlign(pNode, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles as string) + '">'
        text += await genBuChar(pNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj)
        if (rNode === undefined) {
          text += genSpanElement(pNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj)
        } else if (rNode.constructor === Array) {
          for (let j = 0; j < (rNode as []).length; j++) {
            text += genSpanElement(rNode[j], slideLayoutSpNode, slideMasterSpNode, type, warpObj)
            if (pNode['a:br'] !== undefined) {
              text += '<br>'
            }
          }
        } else {
          text += genSpanElement(rNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj)
        }
        text += '</div>'
      }
    } else {
      pNode = textBodyNode["a:p"] as SimplifiedNode
      rNode = pNode['a:r'] as SimplifiedNode
      text += '<div class="slide-prgrph ' + getHorizontalAlign(pNode, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles as string) + '">'
      text += await genBuChar(pNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj)
      if (rNode === undefined) {
        text += genSpanElement(pNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj)
      } else if (rNode.constructor === Array) {
         for (let j = 0; j < (rNode as []).length; j++) {
          text += genSpanElement(rNode[j], slideLayoutSpNode, slideMasterSpNode, type, warpObj)
           if (pNode['a:br'] !== undefined) {
              text += '<br>'
            }
        }
      } else {
        text += genSpanElement(rNode, slideLayoutSpNode, slideMasterSpNode, type, warpObj)
      }
      text += '</div>'
    }
    return text
  }

  const genSpanElement = (node: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode, type?: string, warpObj?: WarpObj): string  => {
    const slideMasterTextStyles = (warpObj as WarpObj)['slideMasterTextStyles'] as string
    let text = node['a:t']
    if (typeof text !== 'string' && !(text instanceof String)) {
      text = getTextByPathList(node, ['a:fld', 'a:t'])
      if (typeof text !== 'string' && !(text instanceof String)) {
        text = '&nbsp;'
      }
    }
    let styleText = 'color:' + getFontColor(node, type, slideMasterTextStyles) + ';font-size:' + getFontSize(node, slideLayoutSpNode, slideMasterSpNode, type, slideMasterTextStyles) + ';font-family:' + getFontType(node, type, slideMasterTextStyles) + ';font-weight:' + getFontBold(node, type, slideMasterTextStyles) + ';font-style:' + getFontItalic(node, type, slideMasterTextStyles) + ';text-decoration:' + getFontDecoration(node, type, slideMasterTextStyles) + ';text-align:' + getTextHorizontalAlign(node, type, slideMasterTextStyles) + ';vertical-align:' + getTextVerticalAlign(node, type, slideMasterTextStyles) +';'
    const highlight = getTextByPathList(node, ['a:rPr', 'a:highlight'])
    if (highlight !== undefined) {
      styleText += 'background-color:#' + getSolidFill(highlight) + ';'
      styleText += 'Opacity:' + getColorOpacity(highlight) + ';'
    }
    let cssName = ''

    if (styleText in styleTable) {
      cssName = styleTable[styleText]['name']
    } else {
      cssName = '_css_' + (Object.keys(styleTable).length + 1)
      styleTable[styleText] = { name: cssName, text: styleText }
    }

    const linkID = getTextByPathList(node, ['a:rPr', 'a:hlinkClick', 'attrs', 'r:id'])
    if (linkID !== undefined) {
      const linkURL = (warpObj as WarpObj)['slideResObj'][linkID]['target'] as string
      return `<span class="text-block ${cssName}"><a href="${linkURL}" target="_blank">${text.replace(/s/i, '&nbsp;')}</a></span>`
    } else {
      return `<span class="text-block ${cssName}">${text.replace(/\s/i, "&nbsp;")}</span>`
    }
  }

  const getTextHorizontalAlign = (node: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    const getAlgn = getTextByPathList(node, ['a:pPr', 'attrs', 'algn'])
    let align = 'initial'
    if (getAlgn !== undefined) {
      switch (getAlgn) {
        case 'l': {
          align = 'left'
          break
        }
        case 'r': {
          align = 'right'
          break;
        }
        case 'ctr': {
          align = 'center'
          break
        }
        case 'just': {
          align = 'justify'
          break
        }
        case 'dist': {
          align = 'justify'
          break
        }
        default:
          align = 'initial'
      }
    }
    return align
  }

  const getTextVerticalAlign = (node: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    const baseline = getTextByPathList(node, ['a:rPr', 'attrs', 'baseline'])
    return baseline === undefined ? 'baseline' : parseInt(baseline) / 1000 + '%'
  }

  const getFontType = (node: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    let typeface = getTextByPathList(node, ['a:rPr', 'a:latin', 'attrs', 'typeface'])
    if (typeface === undefined) {
      const fontSchemeNode = getTextByPathList(themeContent, ['a:theme', 'a:themeElements', 'a:fontScheme'])
      if (type === 'title' || type === 'subTitle' || type === 'ctrTitle') {
        typeface = getTextByPathList(fontSchemeNode, ['a:majorFont', 'a:latin', 'attrs', 'typeface'])
      } else if (type === 'body') {
        typeface = getTextByPathList(fontSchemeNode, ['a:minorFont', 'a:latin', 'attrs', 'typeface'])
      } else {
        typeface = getTextByPathList(fontSchemeNode, ['a:minorFont', 'a:latin', 'attrs', 'typeface'])
      }
    }
    return typeface === undefined ? 'inherit' : typeface
  }

  const getFontDecoration = (node: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    if (node['a:rPr'] !== undefined) {
      const underLine = node['a:rPr']['attrs']['u'] !== undefined ? node['a:rPr']['attrs']['u'] : 'none'
      const strikethrough = node['a:rPr']['attrs']['strike'] !== undefined ? node['a:rPr']['attrs']['strike'] : 'noStrike'
      if (underLine !== 'none' && strikethrough === 'noStrike') {
        return 'underline'
      } else if (underLine === 'none' && strikethrough !== 'noStrike') {
        return 'line-through'
      } else if (underLine !== 'none' && strikethrough !== 'noStrike') {
        return 'underline line-through'
      } else {
        return 'initial'
      }
    } else {
      return 'initial'
    }
  }

  const getFontBold = (node: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    return node['a:rPr'] !== undefined && node['a:rPr']['attrs']['b'] === '1' ? 'bold' : 'initial'
  }

  const getFontItalic = (node: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    return node['a:rPr'] !== undefined && node['a:rPr']['attrs']['i'] === '1' ? 'italic' : 'normal'
  }

  const getFontColor = (node: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string  => {
    const solidFillNode = getTextByPathStr(node, 'a:rPr a:solidFill')
    const color = getSolidFill(solidFillNode)
    return color === undefined || color === 'FFF' ? '#000' : '#' + color
  }

  const getTextByPathStr = (node: SimplifiedNode, pathStr: string): string  => {
    return getTextByPathList(node, pathStr.trim().split(/\s+/))
  }

  const getFontSize = (node: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string  => {
    let fontSize: number | undefined
    let sz: string | undefined
    if (node['a:rPr'] !== undefined) {
      fontSize = parseInt(node['a:rPr']['attrs']['sz']) / 100
    }

    if (isNaN(fontSize as number) || fontSize === undefined) {
      sz = getTextByPathList(slideLayoutSpNode, ['p:txBody', 'a:lstStyle', 'a:lvl1pPr', 'a:defRPr', 'attrs', 'sz'])
      fontSize = parseInt(sz as string) / 100
    }

    if (isNaN(fontSize) || fontSize === undefined) {
      if (type === 'title' || type === 'subTitle' || type === 'ctrTitle') {
        sz = getTextByPathList(slideMasterTextStyles, ['p:titleStyle', 'a:lvl1pPr', 'a:defRPr', 'attrs', 'sz'])
      } else if (type === 'body') {
        sz = getTextByPathList(slideMasterTextStyles, ['p:bodyStyle', 'a:lvl1pPr', 'a:defRPr', 'attrs', 'sz'])
      } else if (type === 'dt' || type === 'sldNum') {
        sz = '1200'
      } else if (type === undefined) {
        sz = getTextByPathList(slideMasterTextStyles, ['p:otherStyle', 'a:lvl1pPr', 'a:defRPr', 'attrs', 'sz'])
      }
      fontSize = parseInt(sz as string) / 100
    }

    const baseline = getTextByPathList(node, ['a:rPr', 'attrs', 'baseline'])
    if (baseline !== undefined && !isNaN(fontSize)) {
      fontSize -= 10
    }
    return isNaN(fontSize) ? 'inherit' : fontSize + 'pt'
  }

  const genBuChar = async (node: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode, type?: string, warpObj?: WarpObj): Promise<string> => {
    const sldMstrTxtStyles = (warpObj as WarpObj)['slideMasterTextStyles'] as string
    const rNode = node['a:r'] as SimplifiedNode
    let dfltBultColor, dfltBultSize, bultColor, bultSize;
    if (rNode !== undefined) {
      dfltBultColor = getFontColor(rNode, type, sldMstrTxtStyles)
      dfltBultSize = getFontSize(rNode, slideLayoutSpNode, slideMasterSpNode, type, sldMstrTxtStyles)
    } else {
      dfltBultColor = getFontColor(node, type, sldMstrTxtStyles)
      dfltBultSize = getFontSize(node, slideLayoutSpNode, slideMasterSpNode, type, sldMstrTxtStyles)
    }
    let bullet = ''
    const pPrNode = node['a:pPr']

    const getRtlVal = getTextByPathList(pPrNode, ['attrs', 'rtl'])
    let isRTL = false
    if (getRtlVal !== undefined && getRtlVal === '1') {
      isRTL = true
    }
    let lvl = parseInt(getTextByPathList(pPrNode, ['attrs', 'lvl']))
    if (isNaN(lvl)) {
      lvl = 0
    }

    const buChar = getTextByPathList(pPrNode, ['a:buChar', 'attrs', 'char'])
    let buType = 'TYPE_NONE'
    const buNum = getTextByPathList(pPrNode, ['a:buAutoNum', 'attrs', 'type']);
    const buPic = getTextByPathList(pPrNode, ['a:buBlip'])
    if (buChar !== undefined) {
      buType = 'TYPE_BULLET'
    }
    if (buNum !== undefined) {
      buType = 'TYPE_NUMERIC'
    }
    if (buPic !== undefined) {
      buType = 'TYPE_BULPIC'
    }

    let buFontAttrs
    if (buType !== 'TYPE_NONE') {
      buFontAttrs = getTextByPathList(pPrNode, ['a:buFont', 'attrs'])
    }
    let defBultColor = 'NoNe'

    if (pPrNode) {
      const buClrNode = pPrNode['a:buClr']
      if (buClrNode !== undefined) {
        defBultColor = getSolidFill(buClrNode) as string
      } else {
        console.log("buClrNode: " + buClrNode);
      }
    }

    if (defBultColor === 'NoNe') {
      bultColor = dfltBultColor
    } else {
      bultColor = '#' + defBultColor
    }
    let buFontSize
    buFontSize = getTextByPathList(pPrNode, ['a:buSzPts', 'attrs', 'val'])
    if (buFontSize !== undefined) {
      bultSize = parseInt(buFontSize) / 100 + 'pt'
    } else {
      buFontSize = getTextByPathList(pPrNode, ['a:buSzPct', 'attrs', 'val'])
      if (buFontSize !== undefined) {
        const prcnt = parseInt(buFontSize) / 100000
        const dfltBultSizeNoPt = dfltBultSize.substr(0, dfltBultSize.length - 2)
        bultSize = prcnt * parseInt(dfltBultSizeNoPt) + 'pt'
      } else {
        bultSize = dfltBultSize
      }
    }
    let marginLeft
    let marginRight
    if (buType === 'TYPE_BULLET') {
      if (buFontAttrs !== undefined) {
        marginLeft = (parseInt(getTextByPathList(pPrNode, ['attrs', 'marL'])) * 96) / 914400
        marginRight = parseInt(buFontAttrs['pitchFamily'])
        if (isNaN(marginLeft)) {
          marginLeft = (328600 * 96) / 914400
        }
        if (isNaN(marginRight)) {
          marginRight = 0
        }
        const typeface = buFontAttrs['typeface']
        bullet = `<span style="font-family: ${typeface}; margin-left: ${marginLeft * lvl}px; margin-right: ${marginRight}px; color:${bultColor}; font-size:${bultSize};`
        if (isRTL) {
          bullet += ' float: right;  direction:rtl'
        }
        bullet += '">' + buChar + '</span>'
      } else {
        marginLeft = ((328600 * 96) / 914400) * lvl
        bullet = `<span style="margin-left: ${marginLeft}px;">${buChar}</span>`
      }
    } else if (buType === 'TYPE_NUMERIC') {
      if (buFontAttrs !== undefined) {
        marginLeft = (parseInt(getTextByPathList(pPrNode, ['attrs', 'marL'])) * 96) / 914400
        marginRight = parseInt(buFontAttrs['pitchFamily'])
        if (isNaN(marginLeft)) {
          marginLeft = (328600 * 96) / 914400
        }
        if (isNaN(marginRight)) {
          marginRight = 0
        }
        bullet = `<span style="margin-left: ${marginLeft * lvl}px; margin-right: ${marginRight}px; color:${bultColor}; font-size:${bultSize};`
        if (isRTL) {
          bullet += ' float: right; direction:rtl;'
        } else {
          bullet += ' float: left; direction:ltr;'
        }
        bullet += `" data-bulltname="${buNum}" data-bulltlvl="${lvl}" class="numeric-bullet-style"></span>`
      } else {
        marginLeft = ((328600 * 96) / 914400) * lvl
        bullet = '<span style="margin-left: ' + marginLeft + 'px;'
        if (isRTL) {
          bullet += ' float: right; direction:rtl;'
        } else {
          bullet += ' float: left; direction:ltr;'
        }
        bullet += `" data-bulltname="${buNum}" data-bulltlvl="${lvl}" class="numeric-bullet-style"></span>`
      }
    } else if (buType === 'TYPE_BULPIC') {
      // PIC BULLET
      marginLeft = (parseInt(getTextByPathList(pPrNode, ['attrs', 'marL'])) * 96) / 914400
      marginRight = (parseInt(getTextByPathList(pPrNode, ['attrs', 'marR'])) * 96) / 914400
      if (isNaN(marginRight)) {
        marginRight = 0
      }
      if (isNaN(marginLeft)) {
        marginLeft = (328600 * 96) / 914400
      } else {
        marginLeft = 0
      }
      const buPicId = getTextByPathList(buPic, ['a:blip', 'attrs', 'r:embed'])
      let buImg
      if (buPicId !== undefined) {
        const imgPath = (warpObj as WarpObj)['slideResObj'][buPicId]['target']
        const imgArrayBuffer = await (warpObj as WarpObj)['zip'].file(imgPath)?.async('arraybuffer')
        const imgExt = imgPath.split('.').pop()
        const imgMimeType = getImageMimeType(imgExt)
        buImg = `<img src="data:${imgMimeType};base64,${base64ArrayBuffer(imgArrayBuffer as ArrayBuffer)}" style="width: 100%; height: 100%"/>`
      }
      if (buPicId === undefined) {
        buImg = '&#8227;'
      }
      bullet = `<span style="margin-left: ${marginLeft * lvl}px; margin-right: ${marginRight}px; width:${bultSize}; display: inline-block; `
      if (isRTL) {
        bullet += ' float: right;direction:rtl'
      }
      bullet += '">' + buImg + '  </span>'
    } else {
      bullet = `<span style="margin-left: ${((328600 * 96) / 914400) * lvl + 'px'}; margin-right: ${0}px;"></span>`
    }
    return bullet
  }

  const getHorizontalAlign = (node: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    let algn = getTextByPathList(node, ['a:pPr', 'attrs', 'algn'])
    if (algn === undefined) { 
      algn = getTextByPathList(slideLayoutSpNode, ['p:txBody', 'a:p', 'a:pPr', 'attrs', 'algn'])
      if (algn === undefined) { 
        algn = getTextByPathList(slideMasterSpNode, ['p:txBody', 'a:p', 'a:pPr', 'attrs', 'algn'])
        if (algn === undefined) {
          switch (type) {
            case 'title':
            case 'subTitle':
            case 'ctrTitle': {
              algn = getTextByPathList(slideMasterTextStyles, ['p:titleStyle', 'a:lvl1pPr', 'attrs', 'alng'])
              break
            }
            default: {
              algn = getTextByPathList(slideMasterTextStyles, ['p:otherStyle', 'a:lvl1pPr', 'attrs', 'alng'])
            }
          }
        }
      }
    }
    if (algn === undefined) {
      if (type === 'title' || type === 'subTitle' || type === 'ctrTitle') {
        return 'h-mid'
      } else if (type === 'sldNum') {
        return 'h-right'
      }
    }
    return algn === 'ctr' ? 'h-mid' : algn === 'r' ? 'h-right' : 'h-left'
  }

  const getVerticalAlign = (node: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode, type?: string, slideMasterTextStyles?: string): string => {
    let anchor = getTextByPathList(node, ['p:txBody', 'a:bodyPr', 'attrs', 'anchor'])
    if (anchor === undefined) {
      anchor = getTextByPathList(slideLayoutSpNode, ['p:txBody', 'a:bodyPr', 'attrs', 'anchor'])
      if (anchor === undefined) {
        anchor = getTextByPathList(slideMasterSpNode, ['p:txBody', 'a:bodyPr', 'attrs', 'anchor'])
      }
    }
    return anchor === 'ctr' ? 'v-mid' : anchor === 'b' ? 'v-down' : 'v-up'
  }

  const getBorder = (node: SimplifiedNode, isSvgMode: boolean): string | Border => {
    let cssText = 'border: '
    const lineNode = node['p:spPr']['a:ln']
    const borderWidth = parseInt(getTextByPathList(lineNode, ['attrs', 'w']) as string) / 12700
    if (isNaN(borderWidth) || borderWidth < 1) {
      cssText += '1pt '
    } else {
      cssText += borderWidth + 'pt '
    }
    const borderType = getTextByPathList(lineNode, ['a:prstDash', 'attrs', 'val'])
    let strokeDasharray = '0'
    switch (borderType) {
      case 'solid': {
        cssText += 'solid'
        strokeDasharray = '0'
        break
      }
      case 'dash': {
        cssText += 'dashed'
        strokeDasharray = '5'
        break
      }
      case 'dashDot': {
        cssText += 'dashed'
        strokeDasharray = '5, 5, 1, 5'
        break
      }
      case 'dot': {
        cssText += 'dotted'
        strokeDasharray = '1, 5'
        break
      }
      case 'lgDash': {
        cssText += 'dashed'
        strokeDasharray = '10, 5'
        break
      }
      case 'lgDashDotDot': {
        cssText += 'dashed'
        strokeDasharray = '10, 5, 1, 5, 1, 5'
        break
      }
      case 'sysDash': {
        cssText += 'dashed'
        strokeDasharray = '5, 2'
        break
      }
      case 'sysDashDot': {
        cssText += 'dashed'
        strokeDasharray = '5, 2, 1, 5'
        break
      }
      case 'sysDashDotDot': {
        cssText += 'dashed'
        strokeDasharray = '5, 2, 1, 5, 1, 5'
        break
      }
      case 'sysDot': {
        cssText += 'dotted'
        strokeDasharray = '2, 5'
        break
      }
      default: {
        cssText += 'solid'
        strokeDasharray = '0'
      }
    }
    let borderColor = getTextByPathList(lineNode, ['a:solidFill', 'a:srgbClr', 'attrs', 'val'])
    if (borderColor === undefined) {
      const schemeClrNode = getTextByPathList(lineNode, ['a:solidFill', 'a:schemeClr'])
      if (schemeClrNode !== undefined) {
        const schemeClr = 'a:' + getTextByPathList(schemeClrNode, ['attrs', 'val'])
        borderColor = getSchemeColorFromTheme(schemeClr, undefined)
      }
    }
    if (borderColor === undefined) {
      const schemeClrNode = getTextByPathList(node, ['p:style', 'a:lnRef', 'a:schemeClr'])
      if (schemeClrNode !== undefined) {
        const schemeClr = 'a:' + getTextByPathList(schemeClrNode, ['attrs', 'val'])
        borderColor = getSchemeColorFromTheme(schemeClr, undefined)
      }
      if (borderColor !== undefined) {
        let shade: string | number  = getTextByPathList(schemeClrNode, ['a:shade', 'attrs', 'val'])
        if (shade !== undefined) {
          shade = parseInt(shade as string) / 100000
          const color = new Color('#' + borderColor)
          color.setLum(color.hsl.l as number * shade)
          borderColor = color.hex.replace('#', '')
        }
      }
    }

    if (borderColor === undefined) {
      borderColor = isSvgMode ? 'none' : '#000'
    } else {
      borderColor = '#' + borderColor
    }
    cssText += ' ' + borderColor + ' '
    if (isSvgMode) {
      return { color: borderColor, width: borderWidth, type: borderType, strokeDasharray: strokeDasharray }
    } else {
      return cssText + ';'
    }
  }

  const getSvgGradient = (w: number, h: number, angl: number, colorArray: (string | number)[], shpId: string): string => {
    const stopsArray = getMiddleStops(colorArray.length - 2) as string[]
    const xyArray = SVGangle(angl, h, w)
    const x1 = xyArray[0]
    const y1 = xyArray[1]
    const x2 = xyArray[2]
    const y2 = xyArray[3]

    const sal = stopsArray.length
    const sr = sal < 20 ? 100 : 1000
    let svgAngle = ` gradientUnits="userSpaceOnUse" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"`
    let svg = `<linearGradient id="linGrd_${shpId}"${svgAngle}>\n`
    for (let i = 0; i < sal; i++) {
      svg += `<stop offset="${Math.round((parseFloat(stopsArray[i]) / 100) * sr) / sr}" stop-color="${colorArray[i]}"`
      svg += '/>\n'
    }
    svg += '</linearGradient>\n' + ''
    return svg
  }

  const getSvgImagePattern = (fillColor: string, shpId: string): string => {
    let ptrn = `<pattern id="imgPtrn_${shpId}"  patternContentUnits="objectBoundingBox"  width="1" height="1">`
    ptrn += `<image  xlink:href="${fillColor}" preserveAspectRatio="none" width="1" height="1"></image>`
    ptrn += '</pattern>'
    return ptrn
  }

  const SVGangle = (deg: number, svgHeight: number, svgWidth: number): [number, number, number, number] => {
    // const w = parseFloat(svgWidth)
    // const h = parseFloat(svgHeight)
    // const ang = parseFloat(deg)
    const w = svgWidth
    const h = svgHeight
    const ang = deg
    let o = 2
    let n = 2
    const wc = w / 2
    const hc = h / 2
    let tx1 = 2
    let ty1 = 2
    let tx2 = 2
    let ty2 = 2
    const k = ((ang % 360) + 360) % 360
    const j = ((360 - k) * Math.PI) / 180
    const i = Math.tan(j)
    const l = hc - i * wc

    if (k === 0) {
      tx1 = w
      ty1 = hc
      tx2 = 0
      ty2 = hc
    } else if (k < 90) {
      n = w
      o = 0
    } else if (k === 90) {
      tx1 = wc
      ty1 = 0
      tx2 = wc
      ty2 = h
    } else if (k < 180) {
      n = 0
      o = 0
    } else if (k === 180) {
      tx1 = 0
      ty1 = hc
      tx2 = w
      ty2 = hc
    } else if (k < 270) {
      n = 0
      o = h
    } else if (k === 270) {
      tx1 = wc
      ty1 = h
      tx2 = wc
      ty2 = 0
    } else {
      n = w
      o = h
    }
    const m = o + n / i
    tx1 = tx1 === 2 ? (i * (m - l)) / (Math.pow(i, 2) + 1) : tx1
    ty1 = ty1 === 2 ? i * tx1 + l : ty1
    tx2 = tx2 === 2 ? w - tx1 : tx2
    ty2 = ty2 === 2 ? h - ty1 : ty2
    const x1 = Math.round((tx2 / w) * 100 * 100) / 100
    const y1 = Math.round((ty2 / h) * 100 * 100) / 100
    const x2 = Math.round((tx1 / w) * 100 * 100) / 100
    const y2 = Math.round((ty1 / h) * 100 * 100) / 100
    return [x1, y1, x2, y2]
  }

  const getMiddleStops = (s: number): string[] | boolean => {
    const sArry = ['0%', '100%']
    if (s === 0) {
      return true
    } else {
      let i = s
      while (i--) {
        const middleStop = 100 - (100 / (s + 1)) * (i + 1)
        const middleStopString = middleStop + '%'
        sArry.splice(-1, 0, middleStopString)
      }
    }
    return sArry
  }


  const getPosition = (slideSpNode?: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode): string => {
    let off: Record<string, any> | undefined
    let x = -1
    let y = -1
    if (slideSpNode !== undefined) {
      off = slideSpNode['a:off']['attrs']
    } else if (slideLayoutSpNode !== undefined) {
      off = slideLayoutSpNode['a:off']['attrs']
    } else if (slideMasterSpNode !== undefined) {
      off = slideMasterSpNode['a:off']['attrs']
    }
    if (off === undefined) {
      return ''
    } else {
      x = (parseInt(off['x'] as string) * 96) / 914400
      y = (parseInt(off['y'] as string) * 96) / 914400
      return isNaN(x) || isNaN(y) ? '' : `top:${y}px; left:${x}px;`
    }
  }

  const getSize = (slideSpNode?: SimplifiedNode, slideLayoutSpNode?: SimplifiedNode, slideMasterSpNode?: SimplifiedNode): string => {
    let ext: Record<string, any> | undefined
    let w = -1
    let h = -1
    if (slideSpNode !== undefined) {
      ext = slideSpNode['a:ext']['attrs']
    } else if (slideLayoutSpNode !== undefined) {
      ext = slideLayoutSpNode['a:ext']['attrs']
    } else if (slideMasterSpNode !== undefined) {
      ext = slideMasterSpNode['a:ext']['attrs']
    }

    if (ext === undefined) {
      return ''
    } else {
      w = (parseInt(ext['cx']) * 96) / 914400
      h = (parseInt(ext['cy']) * 96) / 914400
      return isNaN(w) || isNaN(h) ? '' : `width:${w}px; height:${h}px;`
    }
  }

  const getShapeFill = async (node: SimplifiedNode, isSvgMode: boolean, warpObj: WarpObj) => {
    const fillType = getFillType(getTextByPathList(node, ['p:spPr']) as (SimplifiedNode | string))
    let fillColor: string | GradientFill | undefined
    if (fillType === 'NO_FILL') {
      return isSvgMode ? 'none' : 'background-color: initial;'
    } else if (fillType === 'SOLID_FILL') {
      const shpFill = node['p:spPr']['a:solidFill']
      fillColor = getSolidFill(shpFill)
    } else if (fillType === 'GRADIENT_FILL') {
      const shpFill = node['p:spPr']['a:gradFill']
      fillColor = getGradientFill(shpFill)
    } else if (fillType === 'PATTERN_FILL') {
      const shpFill = node['p:spPr']['a:pattFill']
      fillColor = getPatternFill(shpFill)
    } else if (fillType === 'PIC_FILL') {
      const shpFill = node['p:spPr']['a:blipFill']
      fillColor = await getPicFill('slideBg', shpFill, warpObj)
    }
    if (fillColor === undefined) {
      const clrName = getTextByPathList(node, ['p:style', 'a:fillRef'])
      fillColor = getSolidFill(clrName as string)
    }
    if (fillColor !== undefined) {
      if (fillType === 'GRADIENT_FILL') {
        if (isSvgMode) {
          return fillColor
        } else {
          const colorAry = (fillColor as GradientFill).color
          const rot = (fillColor as GradientFill).rot
          let bgcolor = `background: linear-gradient(${rot}deg,`
          for (let i = 0; i < colorAry.length; i++) {
            if (i === colorAry.length - 1) {
              bgcolor += colorAry[i] + ');'
            } else {
              bgcolor += colorAry[i] + ', '
            }
          }
          return bgcolor
        }
      } else if (fillType === 'PIC_FILL') {
        if (isSvgMode) {
          return fillColor
        } else {
          return `background-image:url(${fillColor});`
        }
      } else {
        if (isSvgMode) {
          const color = new Color(fillColor as string)
          fillColor = color.rgb.toString()
          return fillColor
        } else {
          return `background-color: #${fillColor};`
        }
      }
    } else {
      if (isSvgMode) {
        return 'none'
      } else {
        return 'background-color: initial;'
      }
    }
  }

  const getPatternFill = (node: SimplifiedNode) => {
    const bgClr = node['a:bgClr']
    return getSolidFill(bgClr as string)
  }

  const getGradientFill = (node: SimplifiedNode): GradientFill => {
    const gsLst = node['a:gsLst']['a:gs']
    const colorArray: (string | number)[] = []
    for (let i = 0; i < gsLst.length; i++) {
      let loColor = getSolidFill(gsLst[i])
      if (gsLst[i]['a:srgbClr'] !== undefined) {
        let lumMod = parseInt(getTextByPathList(node, ['a:srgbClr', 'a:lumMod', 'attrs', 'val']) as string) / 100000
        let lumOff = parseInt(getTextByPathList(node, ['a:srgbClr', 'a:lumOff', 'attrs', 'val']) as string) / 100000
        if (isNaN(lumMod)) {
          lumMod = 1.0
        }
        if (isNaN(lumOff)) {
          lumOff = 0
        }
        loColor = applyLumModify(loColor, lumMod, lumOff)
      } else if (gsLst[i]['a:schemeClr'] !== undefined) {
        let lumMod = parseInt(getTextByPathList(gsLst[i], ['a:schemeClr', 'a:lumMod', 'attrs', 'val']) as string) / 100000
        let lumOff = parseInt(getTextByPathList(gsLst[i], [ 'a:schemeClr', 'a:lumOff', 'attrs', 'val']) as string) / 100000
        if (isNaN(lumMod)) {
          lumMod = 1.0
        }
        if (isNaN(lumOff)) {
          lumOff = 0
        }
        loColor = applyLumModify(loColor, lumMod, lumOff)
      }
      colorArray[i] = loColor as string
    }
    const lin = node['a:lin']
    let rot = 0
    if (lin !== undefined) {
      rot = angleToDegrees(lin['attrs']['ang']) + 90
    }
    return { color: colorArray, rot: rot }
  }

  const applyLumModify = (rgbStr = '#FFFFFF', factor: number, offset: number): string => {
    const color = new Color(rgbStr)
    color.setLum(color.hsl.l as number * (1 + offset))
    return color.rgb.toString()
  }

  const indexNodes = (content: SimplifiedNode): IndexNode => {
    const keys = Object.keys(content)
    const spTreeNode = content[keys[0]]['p:cSld']['p:spTree']
    const idTable = {}
    const idxTable = {}
    const typeTable = {}
    
    for (const key in spTreeNode) {
      if (key === 'p:nvGrpSpPr' || key === 'p:grpSpPr') {
        continue
      }
      const targetNode = spTreeNode[key]
      if (targetNode.constructor === Array) {
        for (let i = 0; i < targetNode.length; i++) {
          const nvSpPrNode = targetNode[i]['p:nvSpPr']
          const id = getTextByPathList(nvSpPrNode, ['p:cNvPr', 'attrs', 'id']) as string
          const idx = getTextByPathList(nvSpPrNode, ['p:nvPr', 'p:ph', 'attrs', 'idx']) as string
          const type = getTextByPathList(nvSpPrNode, ['p:nvPr', 'p:ph', 'attrs', 'type']) as string
          if (id !== undefined) idTable[id] = targetNode[i]
          if (idx !== undefined) idxTable[idx] = targetNode[i]
          if (type !== undefined) typeTable[type] = targetNode[i]
        }
      }
    }
    return { idTable: idTable, idxTable: idxTable, typeTable: typeTable }
  }

  const getSlideBackgroundFill = async (slideContent: SimplifiedNode, slideLayoutContent: SimplifiedNode, slideMasterContent: SimplifiedNode, warpObj: WarpObj): Promise<string> => {
    let bgPr = getTextByPathList(slideContent, ['p:sld', 'p:cSld', 'p:bg', 'p:bgPr'])
    let bgRef = getTextByPathList(slideContent, ['p:sld', 'p:cSld', 'p:bg', 'p:bgRef'])
    let bgcolor: string | undefined
    if (bgPr !== undefined) {
      const bgFillTyp = getFillType(bgPr)
      if (bgFillTyp === 'SOLID_FILL') {
        const sldFill = bgPr['a:solidFill']
        const bgColor = getSolidFill(sldFill)
        const sldTint = getColorOpacity(sldFill)
        bgcolor = `background: rgba(${hexToRgbNew(bgColor)}, ${sldTint}");`
      } else if (bgFillTyp === 'GRADIENT_FILL') {
        const grdFill = bgPr['a:gradFill']
        const gsLst = grdFill['a:gsLst']['a:gs']
        const colorArray: string[] = []
        const tintArray: string[] = []
        for (let i = 0; i < gsLst.length; i++) {
          let loTint: string | undefined
          let loColor: string | undefined
          if (gsLst[i]['a:srgbClr'] !== undefined) {
            loColor = getTextByPathList(gsLst[i], ['a:srgbClr', 'attrs', 'val']) as string
            loTint = getTextByPathList(gsLst[i], ['a:srgbClr', 'a:tint', 'attrs', 'val']) as string
          } else if (gsLst[i]['a:schemeClr'] !== undefined) {
            const schemeClr = getTextByPathList(gsLst[i], ['a:schemeClr', 'attrs', 'val'])
            loColor = getSchemeColorFromTheme('a:' + schemeClr, slideMasterContent)
            loTint = getTextByPathList(gsLst[i], ['a:schemeClr', 'a:tint', 'attrs', 'val']) as string
          }
          colorArray[i] = loColor as string
          tintArray[i] = loTint !== undefined ? String(parseInt(loTint) / 100000) : '1'
        }
        const lin = grdFill['a:lin']
        let rot = 90
        if (lin !== undefined) {
          rot = angleToDegrees(lin['attrs']['ang']) + 90
        }
        bgcolor = `background: linear-gradient(${rot}deg,`
        for (let i = 0; i < gsLst.length; i++) {
          if (i === gsLst.length - 1) {
            bgcolor += `rgba(${hexToRgbNew(colorArray[i])},${tintArray[i]}));`
          } else {
            bgcolor += `rgba(${hexToRgbNew(colorArray[i])},${tintArray[i]}), `
          }
        }
      } else if (bgFillTyp === 'PIC_FILL') {
        const picFillBase64 = await getPicFill('slideBg', bgPr['a:blipFill'], warpObj)
        const ordr = bgPr['attrs']['order']
        bgcolor = `background-image: url(${picFillBase64});  z-index: ${ordr};`
      }
    } else if (bgRef !== undefined) {
      let phClr
      if (bgRef['a:srgbClr'] !== undefined) {
        phClr = getTextByPathList(bgRef, ['a:srgbClr', 'attrs', 'val'])
      } else if (bgRef['a:schemeClr'] !== undefined) {
        const schemeClr = getTextByPathList(bgRef, ['a:schemeClr', 'attrs', 'val'])
        phClr = getSchemeColorFromTheme('a:' + schemeClr, slideMasterContent)
      }
      const idx = Number(bgRef['attrs']['idx'])
      if (idx === 0 || idx === 1000) {
        // no background
      } else if (idx > 0 && idx < 1000) {
        
      } else if (idx > 1000) {
        const trueIdx = idx - 1000
        const bgFillLst = (themeContent as SimplifiedNode)['a:theme']['a:themeElements']['a:fmtScheme']['a:bgFillStyleLst']
        const sortblAry: SimplifiedNode[] = []
        Object.keys(bgFillLst).forEach((key: string) => {
          const bgFillLstTyp = bgFillLst[key]
          if (key !== 'attrs') {
            if (bgFillLstTyp.constructor === Array) {
              for (let i = 0; i < bgFillLstTyp.length; i++) {
                const obj = {}
                obj[key] = bgFillLstTyp[i]
                obj['idex'] = bgFillLstTyp[i]['attrs']['order'] as number
                sortblAry.push(obj)
              }
            } else {
              const obj = {}
              obj[key] = bgFillLstTyp
              obj['idex'] = bgFillLstTyp['attrs']['order'] as number
              sortblAry.push(obj)
            }
          }
        })
        const sortByOrder = sortblAry.slice(0)
        sortByOrder.sort((a, b) => {
          return Number(a['idex']) - Number(b['idex'])
        })
        const bgFillLstIdx = sortByOrder[trueIdx - 1]
        const bgFillTyp = getFillType(bgFillLstIdx)
        if (bgFillTyp === 'SOLID_FILL') {
          const sldFill = bgFillLstIdx['a:solidFill']
          const sldTint = getColorOpacity(sldFill as string)
          bgcolor = `background: rgba(${hexToRgbNew(phClr)},${sldTint});`
        } else if (bgFillTyp === 'GRADIENT_FILL') {
          const grdFill = bgFillLstIdx['a:gradFill']
          const gsLst = grdFill['a:gsLst']['a:gs']

          const tintArray: string[] = []
          for (let i = 0; i < gsLst.length; i++) {
            const loTint = getTextByPathList(gsLst[i], ['a:schemeClr', 'a:tint', 'attrs', 'val']) as string
            tintArray[i] = loTint !== undefined ? String(parseInt(loTint) / 100000) : '1'
          }
          const lin = grdFill['a:lin']
          let rot = 90
          if (lin !== undefined) {
            rot = angleToDegrees(lin['attrs']['ang']) + 90
          }
          bgcolor = `background: linear-gradient(${rot}deg,`
          for (let i = 0; i < gsLst.length; i++) {
            if (i === gsLst.length - 1) {
              bgcolor += `rgba(${hexToRgbNew(phClr)},${tintArray[i]}));`
            } else {
              bgcolor += `rgba(${hexToRgbNew(phClr)},${tintArray[i]}), `
            }
          }
        }
      }
    } else {
      bgPr = getTextByPathList(slideLayoutContent, [ 'p:sldLayout', 'p:cSld', 'p:bg', 'p:bgPr'])
      bgRef = getTextByPathList(slideLayoutContent, [ 'p:sldLayout', 'p:cSld', 'p:bg', 'p:bgRef'])
      if (bgPr !== undefined) {
        const bgFillTyp = getFillType(bgPr)
        if (bgFillTyp === 'SOLID_FILL') {
          const sldFill = bgPr['a:solidFill']
          const bgColor = getSolidFill(sldFill)
          const sldTint = getColorOpacity(sldFill)
          bgcolor = `background: rgba(${hexToRgbNew(bgColor)},${sldTint});`
        } else if (bgFillTyp === 'GRADIENT_FILL') {
          const grdFill = bgPr['a:gradFill']
          const gsLst = grdFill['a:gsLst']['a:gs']
          const colorArray: string[] = []
          const tintArray: string[] = []
          for (let i = 0; i < gsLst.length; i++) {
            let loTint: string | undefined
            let loColor: string | undefined
            if (gsLst[i]['a:srgbClr'] !== undefined) {
              loColor = getTextByPathList(gsLst[i], ['a:srgbClr', 'attrs', 'val']) as string
              loTint = getTextByPathList(gsLst[i], ['a:srgbClr', 'a:tint', 'attrs', 'val']) as string
            } else if (gsLst[i]['a:schemeClr'] !== undefined) {
              const schemeClr = getTextByPathList(gsLst[i], ['a:schemeClr', 'attrs', 'val'])
              loColor = getSchemeColorFromTheme('a:' + schemeClr, slideMasterContent)
              loTint = getTextByPathList(gsLst[i], ['a:schemeClr', 'a:tint', 'attrs', 'val']) as string
            }
            colorArray[i] = loColor as string
            tintArray[i] = loTint !== undefined ? String(parseInt(loTint) / 100000) : '1'
          }
          const lin = grdFill['a:lin']
          let rot = 90
          if (lin !== undefined) {
            rot = angleToDegrees(lin['attrs']['ang']) + 90
          }

          bgcolor = `background: linear-gradient(${rot}deg,`
          for (let i = 0; i < gsLst.length; i++) {
            if (i === gsLst.length - 1) {
              bgcolor += `rgba(${hexToRgbNew(colorArray[i])},${tintArray[i]}));`
            } else {
              bgcolor += `rgba(${hexToRgbNew(colorArray[i])},${tintArray[i]}), `
            }
          }
        } else if (bgFillTyp === 'PIC_FILL') {
          const picFillBase64 = await getPicFill('layoutBg', bgPr['a:blipFill'], warpObj)
          const ordr = bgPr['attrs']['order']
          bgcolor = `background-image: url(${picFillBase64}); z-index: ${ordr};`
        }
      } else if (bgRef !== undefined) {
        bgcolor = 'background: red;'
      } else {
        bgPr = getTextByPathList(slideMasterContent, ['p:sldMaster', 'p:cSld', 'p:bg', 'p:bgPr'])
        bgRef = getTextByPathList(slideMasterContent, ['p:sldMaster', 'p:cSld', 'p:bg', 'p:bgRef'])
        if (bgPr !== undefined) {
          const bgFillTyp = getFillType(bgPr)
          if (bgFillTyp === 'SOLID_FILL') {
            const sldFill = bgPr['a:solidFill']
            const bgColor = getSolidFill(sldFill)
            const sldTint = getColorOpacity(sldFill)
            bgcolor = `background: rgba(${hexToRgbNew(bgColor)},${sldTint});`
          } else if (bgFillTyp === 'GRADIENT_FILL') {
            const grdFill = bgPr['a:gradFill']
            const gsLst = grdFill['a:gsLst']['a:gs']
            const colorArray: string[] = []
            const tintArray: string[] = []
            for (let i = 0; i < gsLst.length; i++) {
              let loTint: string | undefined
              let loColor: string | undefined
              if (gsLst[i]['a:srgbClr'] !== undefined) {
                loColor = getTextByPathList(gsLst[i], ['a:srgbClr', 'attrs', 'val']) as string
                loTint = getTextByPathList(gsLst[i], ['a:srgbClr', 'a:tint', 'attrs', 'val']) as string
              } else if (gsLst[i]['a:schemeClr'] !== undefined) {
                const schemeClr = getTextByPathList(gsLst[i], ['a:schemeClr', 'attrs', 'val'])
                loColor = getSchemeColorFromTheme('a:' + schemeClr, slideMasterContent)
                loTint = getTextByPathList(gsLst[i], ['a:schemeClr', 'a:tint', 'attrs', 'val']) as string
              }
              colorArray[i] = loColor as string
              tintArray[i] = loTint !== undefined ? String(parseInt(loTint) / 100000) : '1'
            }
            const lin = grdFill['a:lin']
            let rot = 90
            if (lin !== undefined) {
              rot = angleToDegrees(lin['attrs']['ang']) + 90
            }

            bgcolor = `background: linear-gradient(${rot}deg,`
            for (let i = 0; i < gsLst.length; i++) {
              if (i === gsLst.length - 1) {
                bgcolor += `rgba(${hexToRgbNew(colorArray[i])},${tintArray[i]}));`
              } else {
                bgcolor += `rgba(${hexToRgbNew(colorArray[i])},${tintArray[i]}), `
              }
            }
          } else if (bgFillTyp === 'PIC_FILL') {
            const picFillBase64 = await getPicFill('masterBg', bgPr['a:blipFill'], warpObj)
            const ordr = bgPr['attrs']['order']
            bgcolor = `background-image: url(${picFillBase64}); z-index: ${ordr};`
          }
        } else if (bgRef !== undefined) {
          let phClr: string | undefined
          if (bgRef['a:srgbClr'] !== undefined) {
            phClr = getTextByPathList(bgRef, ['a:srgbClr', 'attrs', 'val']) as string
          } else if (bgRef['a:schemeClr'] !== undefined) {
            const schemeClr = getTextByPathList(bgRef, ['a:schemeClr', 'attrs', 'val'])
            phClr = getSchemeColorFromTheme('a:' + schemeClr, slideMasterContent)
          }
          const idx = Number(bgRef['attrs']['idx'])
          if (idx === 0 || idx === 1000) {
            
          } else if (idx > 0 && idx < 1000) {
            
          } else if (idx > 1000) {
            const trueIdx = idx - 1000;
            const bgFillLst = (themeContent as SimplifiedNode)['a:theme']['a:themeElements']['a:fmtScheme']['a:bgFillStyleLst']
            const sortblAry: SimplifiedNode[] = []
            Object.keys(bgFillLst).forEach((key: string) => {
              const bgFillLstTyp = bgFillLst[key]
              if (key !== 'attrs') {
                if (bgFillLstTyp.constructor === Array) {
                  for (let i = 0; i < bgFillLstTyp.length; i++) {
                    const obj = {}
                    obj[key] = bgFillLstTyp[i]
                    obj['idex'] = bgFillLstTyp[i]['attrs']['order'] as number
                    sortblAry.push(obj)
                  }
                } else {
                  const obj = {}
                  obj[key] = bgFillLstTyp
                  obj['idex'] = bgFillLstTyp['attrs']['order'] as number
                  sortblAry.push(obj)
                }
              }
            })
            const sortByOrder = sortblAry.slice(0)
            sortByOrder.sort((a, b) => {
              return Number(a['idex']) - Number(b['idex'])
            })
            const bgFillLstIdx = sortByOrder[trueIdx - 1]
            const bgFillTyp = getFillType(bgFillLstIdx)
            if (bgFillTyp === 'SOLID_FILL') {
              const sldFill = bgFillLstIdx['a:solidFill']
              const sldTint = getColorOpacity(sldFill as string)
              bgcolor = `background: rgba(${hexToRgbNew(phClr)},${sldTint});`
            } else if (bgFillTyp === 'GRADIENT_FILL') {
              const grdFill = bgFillLstIdx['a:gradFill']
              const gsLst = grdFill['a:gsLst']['a:gs']

              const tintArray: string[] = []
              for (let i = 0; i < gsLst.length; i++) {
                const loTint = getTextByPathList(gsLst[i], ['a:schemeClr', 'a:tint', 'attrs', 'val']) as string
                tintArray[i] = loTint !== undefined ? String(parseInt(loTint) / 100000) : '1'
              }
              const lin = grdFill['a:lin']
              let rot = 90
              if (lin !== undefined) {
                rot = angleToDegrees(lin['attrs']['ang']) + 90
              }
              bgcolor = `background: linear-gradient(${rot}deg,`
              for (let i = 0; i < gsLst.length; i++) {
                if (i === gsLst.length - 1) {
                  bgcolor += `rgba(${hexToRgbNew(phClr)},${tintArray[i]}));`
                } else {
                  bgcolor += `rgba(${hexToRgbNew(phClr)},${tintArray[i]}), `
                }
              }
            } else {
              
            }
          }
        }
      }
    }
    return bgcolor as string
  }


  const getFillType = (node: string | SimplifiedNode): FillType => {
    let fillType = ''
    if (node['a:noFill'] !== undefined) {
      fillType = 'NO_FILL'
    }
    if (node['a:solidFill'] !== undefined) {
      fillType = 'SOLID_FILL'
    }
    if (node['a:gradFill'] !== undefined) {
      fillType = 'GRADIENT_FILL'
    }
    if (node['a:pattFill'] !== undefined) {
      fillType = 'PATTERN_FILL'
    }
    if (node['a:blipFill'] !== undefined) {
      fillType = 'PIC_FILL'
    }
    return fillType
  }

  const getSolidFill = (node: string): string | undefined => {
    if (node === undefined) {
      return undefined
    }
    let color = 'FFF'
    if (node['a:srgbClr'] !== undefined) {
      color = getTextByPathList(node, ['a:srgbClr', 'attrs', 'val']) as string
    } else if (node['a:schemeClr'] !== undefined) {
      const schemeClr = getTextByPathList(node, ['a:schemeClr', 'attrs', 'val'])
      color = getSchemeColorFromTheme('a:' + schemeClr, undefined)
    } else if (node['a:scrgbClr'] !== undefined) {
      const defBultColorVals = node['a:scrgbClr']['attrs']
      const red = defBultColorVals['r'].indexOf('%') !== -1 ? defBultColorVals['r'].split('%').shift() : defBultColorVals['r']
      const green = defBultColorVals['g'].indexOf('%') !== -1 ? defBultColorVals['g'].split('%').shift() : defBultColorVals['g']
      const blue = defBultColorVals['b'].indexOf('%') !== -1 ? defBultColorVals['b'].split('%').shift() : defBultColorVals['b'];
      color = toHex(255 * (Number(red) / 100)) + toHex(255 * (Number(green) / 100)) + toHex(255 * (Number(blue) / 100));
    } else if (node['a:prstClr'] !== undefined) {
      const prstClr = node['a:prstClr']['attrs']['val']
      color = getColorName2Hex(prstClr)
    } else if (node['a:hslClr'] !== undefined) {
      const defBultColorVals = node['a:hslClr']['attrs']
      const hue = Number(defBultColorVals['hue']) / 100000
      const sat = Number(defBultColorVals['sat'].indexOf('%') !== -1 ? defBultColorVals['sat'].split('%').shift() : defBultColorVals['sat']) / 100
      const lum = Number(defBultColorVals['lum'].indexOf('%') !== -1 ? defBultColorVals['lum'].split('%').shift() : defBultColorVals['lum']) / 100
      // const hslClr = defBultColorVals['hue'] + ',' + defBultColorVals['sat'] + ',' + defBultColorVals['lum']
      const hsl2rgb = hslToRgb(hue, sat, lum)
      color = toHex(hsl2rgb.r) + toHex(hsl2rgb.g) + toHex(hsl2rgb.b)
      // defBultColor = cnvrtHslColor2Hex(hslClr); //TODO
      // console.log("hslClr: " + hslClr);
    } else if (node["a:sysClr"] !== undefined) {
      // <a:sysClr val="windowText" lastClr="000000"/>  //Need to test/////////////////////////////////////////////
      const sysClr = getTextByPathList(node, ['a:sysClr', 'attrs', 'lastClr'])
      if (sysClr !== undefined) {
        color = sysClr as string
      }
    }
    return color
  }

  const getSchemeColorFromTheme = (schemeClr: string, sldMasterNode: string | undefined | SimplifiedNode): string => {
    if (slideLayoutClrOvride === '' || slideLayoutClrOvride === undefined) {
      slideLayoutClrOvride = getTextByPathList(sldMasterNode, ['p:sldMaster', 'p:clrMap', 'attrs']) || {}
    }
    const schmClrName = schemeClr.substring(2)
    switch (schmClrName) {
      case 'tx1':
      case 'tx2':
      case 'bg1':
      case 'bg2': {
        schemeClr = 'a:' + (slideLayoutClrOvride as Record<string, any>)[schmClrName]
        break
      }
    }

    const refNode = getTextByPathList(themeContent, ['a:theme', 'a:themeElements', 'a:clrScheme', schemeClr])
    let color = getTextByPathList(refNode, ['a:srgbClr', 'attrs', 'val'])
    if (color === undefined) {
      color = getTextByPathList(refNode, ['a:sysClr', 'attrs', 'lastClr'])
    }
    return color as string
  }

  const toHex = (num: number) => {
    let hex = num.toString(16)
    while (hex.length < 2) {
      hex = '0' + hex
    }
    return hex
  }

  const getColorName2Hex = (name: string): string => {
    let hex: string = ''
    const colorName = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGrey', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkSlateGrey', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DimGrey', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Grey', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed', 'Indigo', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGrey', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSlateGrey', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'SlateGrey', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen']
    const colorHex = ['f0f8ff', 'faebd7', '00ffff', '7fffd4', 'f0ffff', 'f5f5dc', 'ffe4c4', '000000', 'ffebcd', '0000ff', '8a2be2', 'a52a2a', 'deb887', '5f9ea0', '7fff00', 'd2691e', 'ff7f50', '6495ed', 'fff8dc', 'dc143c', '00ffff', '00008b', '008b8b', 'b8860b', 'a9a9a9', 'a9a9a9', '006400', 'bdb76b', '8b008b', '556b2f', 'ff8c00', '9932cc', '8b0000', 'e9967a', '8fbc8f', '483d8b', '2f4f4f', '2f4f4f', '00ced1', '9400d3', 'ff1493', '00bfff', '696969', '696969', '1e90ff', 'b22222', 'fffaf0', '228b22', 'ff00ff', 'dcdcdc', 'f8f8ff', 'ffd700', 'daa520', '808080', '808080', '008000', 'adff2f', 'f0fff0', 'ff69b4', 'cd5c5c', '4b0082', 'fffff0', 'f0e68c', 'e6e6fa', 'fff0f5', '7cfc00', 'fffacd', 'add8e6', 'f08080', 'e0ffff', 'fafad2', 'd3d3d3', 'd3d3d3', '90ee90', 'ffb6c1', 'ffa07a', '20b2aa', '87cefa', '778899', '778899', 'b0c4de', 'ffffe0', '00ff00', '32cd32', 'faf0e6', 'ff00ff', '800000', '66cdaa', '0000cd', 'ba55d3', '9370db', '3cb371', '7b68ee', '00fa9a', '48d1cc', 'c71585', '191970', 'f5fffa', 'ffe4e1', 'ffe4b5', 'ffdead', '000080', 'fdf5e6', '808000', '6b8e23', 'ffa500', 'ff4500', 'da70d6', 'eee8aa', '98fb98', 'afeeee', 'db7093', 'ffefd5', 'ffdab9', 'cd853f', 'ffc0cb', 'dda0dd', 'b0e0e6', '800080', '663399', 'ff0000', 'bc8f8f', '4169e1', '8b4513', 'fa8072', 'f4a460', '2e8b57', 'fff5ee', 'a0522d', 'c0c0c0', '87ceeb', '6a5acd', '708090', '708090', 'fffafa', '00ff7f', '4682b4', 'd2b48c', '008080', 'd8bfd8', 'ff6347', '40e0d0', 'ee82ee', 'f5deb3', 'ffffff', 'f5f5f5', 'ffff00', '9acd32']
    const findIndx = colorName.indexOf(name)
    if (findIndx !== -1) {
      hex = colorHex[findIndx]
    }
    return hex
  }

  function getColorOpacity(solidFill: string): number | undefined {
    if (solidFill === undefined) {
      return undefined
    }
    let opcity = 1

    if (solidFill["a:srgbClr"] !== undefined) {
      const tint = getTextByPathList(solidFill, ['a:srgbClr', 'a:tint', 'attrs', 'val']) as string
      if (tint !== undefined) {
        opcity = parseInt(tint) / 100000
      }
    } else if (solidFill['a:schemeClr'] !== undefined) {
      const tint = getTextByPathList(solidFill, ['a:schemeClr', 'a:tint', 'attrs', 'val']) as string
      if (tint !== undefined) {
        opcity = parseInt(tint) / 100000
      }
    } else if (solidFill['a:scrgbClr'] !== undefined) {
      const tint = getTextByPathList(solidFill, ['a:scrgbClr', 'a:tint', 'attrs', 'val']) as string
      if (tint !== undefined) {
        opcity = parseInt(tint) / 100000
      }
    } else if (solidFill['a:prstClr'] !== undefined) {
      const tint = getTextByPathList(solidFill, ['a:prstClr', 'a:tint', 'attrs', 'val']) as string
      if (tint !== undefined) {
        opcity = parseInt(tint) / 100000
      }
    } else if (solidFill['a:hslClr'] !== undefined) {
      const tint = getTextByPathList(solidFill, ['a:hslClr', 'a:tint', 'attrs', 'val']) as string
      if (tint !== undefined) {
        opcity = parseInt(tint) / 100000
      }
    } else if (solidFill['a:sysClr'] !== undefined) {
      const tint = getTextByPathList(solidFill, ['a:sysClr', 'a:tint', 'attrs', 'val']) as string
      if (tint !== undefined) {
        opcity = parseInt(tint) / 100000
      }
    }
    return opcity
  }
  
  const getTextByPathList = (node: SimplifiedNode | any, path: string[]): any => {
    if (path.constructor !== Array) {
      throw new Error('Error of path type! path is not array.')
    }
    if (node === undefined) {
      return undefined
    }
    const l = path.length
    for (let i = 0; i < l; i++) {
      node = node[path[i]]
      if (node === undefined) {
        return undefined
      }
    }
    return node
  }
  
  const hexToRgbNew = (hex: string = 'FFFFFF'): string => {
    const arrBuff = new ArrayBuffer(4)
    const vw = new DataView(arrBuff)
    vw.setUint32(0, parseInt(hex, 16), false)
    const arrByte = new Uint8Array(arrBuff)
    return arrByte[1] +',' + arrByte[2] + ',' + arrByte[3]
  }
  
  const hslToRgb = (hue: number, sat: number, light: number): { r: number, g: number, b: number } =>  {
    let t1: number, t2: number, r: number, g: number, b: number
    hue = hue / 60
    if (light <= 0.5) {
      t2 = light * (sat + 1)
    } else {
      t2 = light + sat - light * sat
    }
    t1 = light * 2 - t2
    r = hueToRgb(t1, t2, hue + 2) * 255
    g = hueToRgb(t1, t2, hue) * 255
    b = hueToRgb(t1, t2, hue - 2) * 255
    return { r: r, g: g, b: b }
  }

  const hueToRgb = (t1: number, t2: number, hue: number): number => {
    if (hue < 0) hue += 6
    if (hue >= 6) hue -= 6
    if (hue < 1) return (t2 - t1) * hue + t1
    else if (hue < 3) return t2
    else if (hue < 4) return (t2 - t1) * (4 - hue) + t1
    else return t1
  }
  
  const getPicFill = async (type: string, node: any, warpObj: WarpObj): Promise<string | undefined> => {
    let img: string
    let imgPath: string | undefined
    const rId = node['a:blip']['attrs']['r:embed']
    if (type === 'slideBg') {
      imgPath = getTextByPathList(warpObj, ['slideResObj', rId, 'target']) as string
    } else if (type === 'layoutBg') {
      imgPath = getTextByPathList(warpObj, ['layoutResObj', rId, 'target']) as string
    } else if (type === 'masterBg') {
      imgPath = getTextByPathList(warpObj, ['masterResObj', rId, 'target']) as string
    }
    if (imgPath === undefined) {
      return undefined
    }
    const imgExt = imgPath.split('.').pop()
    if (imgExt === 'xml') {
      return undefined
    }
    const imgArrayBuffer = await warpObj.zip.file('imgPath')?.async('arraybuffer')
    const imgMimeType = getImageMimeType(imgExt as ImageSuffix)
    img = 'data:' + imgMimeType + ';base64,' + base64ArrayBuffer(imgArrayBuffer as ArrayBuffer)
    return img
  }

  const angleToDegrees = (angle: string | undefined | number): number => {
    if (angle === '' || angle == null) {
      return 0
    }
    return Math.round((angle as number) / 60000)
  }
  const base64ArrayBuffer = (arrayBuff: ArrayBuffer): string => {
    const buff = new Uint8Array(arrayBuff)
    let text = ''
    for (let i = 0; i < buff.byteLength; i++) {
      text += String.fromCharCode(buff[i])
    }
    return btoa(text)
  }
  
  const getImageMimeType = (imgFileExt: ImageSuffix) =>{
    let mimeType: ImageMimeType
    switch (imgFileExt.toLowerCase()) {
      case 'jpg':
      case 'jpeg': {
        mimeType = 'image/jpeg'
        break
      }
      case 'png': {
        mimeType = "image/png"
        break
      }
      case 'gif': {
        mimeType = 'image/gif'
        break
      }
      case 'emf': {
        mimeType = 'image/x-emf'
        break
      }
      case 'wmf': {
        mimeType = 'image/x-wmf'
        break
      }
      case 'svg': {
        mimeType = 'image/svg+xml'
        break
      }
      default: {
        mimeType = 'image/*'
      }
    }
    return mimeType
  }

  const genGlobalCSS = () => {
    let cssText = ''
    for (let key in styleTable) {
      cssText += 'section .' + styleTable[key]['name'] + '{' + styleTable[key]['text'] + '}\n'
    }
    return cssText
  }
}

 




