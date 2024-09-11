import request from '@/utils/request'
import { ComputerInfo } from './type'

export const info = () => {
  return request<unknown, Promise<ApiSpace.Result<ComputerInfo>>>({
    url: '/monitor/server/info',
    method: 'get'
  })
}