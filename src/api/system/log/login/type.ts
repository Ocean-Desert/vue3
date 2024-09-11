import { TableData } from '@arco-design/web-vue'

export interface SysLogininfo extends TableData {
  id?: number
  username?: string
  ipaddr?: string
  address?: string
  browserName?: string
  browserVersion?: string
  clientType?: string
  systemType?: string
  status?: string
  msg?: string
  loginTime?: string
  params?: any
}

export interface SysLogininfoParams extends ApiSpace.PageParams {
  username?: string
  status?: string
  params?: any
}