import request from '@/utils/request'
import type { LoggerMessage } from './type'

export const loggerList = (levels: string) => {
  return request<unknown, Promise<ApiSpace.Result<LoggerMessage[]>>>({
    url: '/monitor/console/list' + levels,
    method: 'get'
  })
}

export const download = (levels: string) => {
  return request<unknown, Promise<Blob>>({
    url: '/monitor/console/download' + levels,
    method: 'get',
    responseType: 'blob',
  })
}