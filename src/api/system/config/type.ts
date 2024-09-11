import { TableData } from '@arco-design/web-vue'

export interface SysConfig extends TableData {
  id?: number
  name?: string
  key?: string
  value?: string
  type?: boolean
  remark?: string
}

export interface SysConfigParams extends ApiSpace.PageParams {
  name?: string
  key?: string
  type?: boolean
}