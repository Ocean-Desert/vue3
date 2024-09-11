import request from '@/utils/request'
import { SysUserOnline, SysUserOnlineParams } from './type'
import qs from 'qs'

export const onlinePage = (params: SysUserOnlineParams) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysUserOnline[]>>>>({
    url: '/monitor/online/page' + (params && `?${qs.stringify(params)}`),
    method: 'get'
  })
}

export const forceLogout = (token: string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/monitor/online/' + token,
    method: 'delete'
  })
}