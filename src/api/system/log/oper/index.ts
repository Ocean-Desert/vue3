import request from '@/utils/request'
import { SysLog, SysLogParams } from './type'
import qs from 'qs'

export const logPage = (params: SysLogParams) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysLog>>>>({
    url: '/system/log/page' + (params && `?${qs.stringify(params)}`),
    method: 'get',
  })
}

export const logOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysLog>>>({
    url: '/system/log/' + id,
    method: 'get'
  })
}

export const logDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/log/' + id,
    method: 'delete'
  })
}

export const clean = () => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/log/clean',
    method: 'delete'
  })
}