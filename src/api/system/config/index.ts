import request from '@/utils/request'
import { SysConfig, SysConfigParams } from './type'

export const configList = (params: SysConfigParams) => {
  return request<unknown, Promise<ApiSpace.Result<SysConfig[]>>>({
    url: '/system/config/list',
    method: 'get',
    params
  })
}

export const configPage = (params: SysConfigParams) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysConfig[]>>>>({
    url: '/system/config/page',
    method: 'get',
    params
  })
}

export const configOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysConfig>>>({
    url: '/system/config/' + id,
    method: 'get'
  })
}

export const configUpdate = (data: SysConfig) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/config',
    method: 'put',
    data
  })
}

export const configAdd = (data: SysConfig) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/config',
    method: 'post',
    data
  })
}

export const configDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/config/' + id,
    method: 'delete'
  })
}

export const getConfig = (param: string) => {
  return request<unknown, Promise<ApiSpace.Result<string>>>({
    url: '/system/config/key/' + param,
    method: 'get'
  })
}