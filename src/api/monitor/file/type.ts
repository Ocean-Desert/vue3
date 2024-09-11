import type { TableData } from '@arco-design/web-vue'

export interface FileAttrsParams extends ApiSpace.PageParams {
  path?: string
  name?: string
}

export interface FileAttrs extends TableData {
  name?: string
  path?: string
  size?: number
  sizeType?: string
  root?: string
  type?: number
  typeName?: string
  createTime?: string
  updateTime?: string
  isRename?: boolean
}

