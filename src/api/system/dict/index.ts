import request from '@/utils/request'
import type { SysDictData, SysDictDataParams, SysDictType, SysDictTypeParams } from './type'

export const dictPage = (params: SysDictTypeParams) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysDictType>>>>({
    url: '/system/dict/page',
    method: 'get',
    params
  })
}

export const dictList = (params: SysDictTypeParams) => {
  return request<unknown, Promise<ApiSpace.Result<SysDictType[]>>>({
    url: '/system/dict/list',
    method: 'get',
    params
  })
}

export const dictOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysDictType>>>({
    url: '/system/dict/' + id,
    method: 'get'
  })
}

export const dictUpdate = (data: SysDictType) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dict',
    method: 'put',
    data
  })
}

export const dictAdd = (data: SysDictType) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dict',
    method: 'post',
    data
  })
}

export const dictDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dict/' + id,
    method: 'delete'
  })
}

export const refresh = () => {
  return request<unknown, ApiSpace.Result<unknown>>({
    url: '/system/dict/refresh',
    method: 'get'
  })
}

//////////////////////////////////////////////////////////////

export const dictDataPage = (params: SysDictDataParams) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysDictData>>>>({
    url: '/system/dict/data/page',
    method: 'get',
    params
  })
}

export const dictDataList = (params: SysDictDataParams) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysDictData>>>>({
    url: '/system/dict/data/list',
    method: 'get',
    params
  })
}

export const dictDataOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysDictData>>>({
    url: '/system/dict/data/' + id,
    method: 'get'
  })
}

export const dictDataUpdate = (data: SysDictData) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dict/data',
    method: 'put',
    data
  })
}

export const dictDataAdd = (data: SysDictData) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dict/data',
    method: 'post',
    data
  })
}

export const dictDataDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dict/data/' + id,
    method: 'delete'
  })
}


export const dict = (dictType: string) => request<unknown, Promise<ApiSpace.Result<SysDictData[]>>>({ url: '/system/dict/type/' + dictType, method: 'get' })

