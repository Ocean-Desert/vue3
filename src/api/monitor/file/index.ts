import request from '@/utils/request'
import type { FileAttrs, FileAttrsParams } from './type'
export const fileList = (params: FileAttrsParams) => {
  return request<unknown, Promise<ApiSpace.Result<FileAttrs[]>>>({
    url: '/monitor/file/list',
    method: 'get',
    params
  })
}

export const fileSave = (rootPath: string, name: string) => { 
 return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: `/monitor/file?path=${rootPath}&fileName=${name}`,
    method: 'post',
  })
}

export const fileRemove = (path: string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/monitor/file',
    method: 'delete',
    params: { path }
  })
}

export const fileRename = (data: FileAttrs) => {
 return request<unknown, Promise<ApiSpace.Result>>({
    url: '/monitor/file',
    method: 'put',
    params: data
  })
}