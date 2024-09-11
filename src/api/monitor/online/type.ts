import { TableData } from '@arco-design/web-vue'

export interface SysUserOnline extends TableData {
  id?: number
  token?: string
  username?: string
  ip?: string
  loginLocation?: string
  browser?: string
  system?: string
  loginTime?: string
}

export interface SysUserOnlineParams extends ApiSpace.PageParams {
  username?: string
  beginTime?: string
  endTime?: string
}