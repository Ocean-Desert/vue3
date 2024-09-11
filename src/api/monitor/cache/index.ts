import request from '@/utils/request'
import { SysCache } from './type'

export const getNames = () => {
  return request<unknown, Promise<ApiSpace.Result<SysCache[]>>>({
    url: '/monitor/cache/getNames',
    method: 'get'
  })
}

export const listByName = (cacheName: string) => {
  return request<unknown, Promise<ApiSpace.Result<string[]>>>({
    url: '/monitor/cache/getKeys/' + cacheName,
    method: 'get'
  })
}

export const getValue = (cacheName: string, cacheKey: string) => {
  return request<unknown, Promise<ApiSpace.Result<SysCache>>>({
    url: '/monitor/cache/getValue/' + cacheName + '/' + cacheKey,
    method: 'get'
  })
}

export const clearKey = (cacheKey: string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/monitor/cache/clearKey/' + cacheKey,
    method: 'delete'
  })
}

export const clearName = (cacheName: string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/monitor/cache/clearName/' + cacheName,
    method: 'delete'
  })
}

export const clearAll = () => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/monitor/cache/clear',
    method: 'delete'
  })
}
