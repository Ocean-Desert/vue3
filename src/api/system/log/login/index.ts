import request from '@/utils/request'
import { SysLogininfo, SysLogininfoParams } from './type'
import qs from 'qs'

export const logininfoPage = (params: SysLogininfoParams) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysLogininfo>>>>({
    url: '/system/logininfo/page' + (params && `?${qs.stringify(params)}`),
    method: 'get'
  })
}

export const logininfoDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/logininfo/' + id,
    method: 'delete'
  })
}

export const clean = () => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/logininfo/clean',
    method: 'delete'
  })
}