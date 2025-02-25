import request from '@/utils/request'
import type { GenTable, GenTableColumn, GenTableInfo, GenTableParams } from './type'
import qs from 'qs'

export const genTablePage = (params: GenTableParams) => {
  return request<GenTableParams, ApiSpace.Result<ApiSpace.PageResult<GenTable[]>>>({
    url: '/tool/gen/page' + (params && `?${qs.stringify(params)}`),
    method: 'get',
  })
}

export const genTableInfo = (id: number | string) => {
  return request<unknown, ApiSpace.Result<GenTableInfo>>({
    url: '/tool/gen/' + id,
    method: 'get'
  })
}

export const dbTablePage = (params: GenTableParams) => {
  return request<GenTableParams, ApiSpace.Result<ApiSpace.PageResult<GenTable[]>>>({
    url: '/tool/gen/db/page' + (params && `?${qs.stringify(params)}`),
    method: 'get',
  })
}

export const genTableColumnList = (tableId: number | string) => {
  return request<unknown, ApiSpace.Result<GenTableColumn[]>>({
    url: '/tool/gen/columns/' + tableId,
    method: 'get'
  })
}

export const importTable = (tables: (string | number)[]) => {
  return request<unknown, ApiSpace.Result<boolean>>({
    url: '/tool/gen/importTable?tables=' + tables.join(','),
    method: 'post'
  })
}

export const genTableUpdate = (data: GenTable) => {
  return request<GenTable, ApiSpace.Result<boolean>>({
    url: '/tool/gen',
    method: 'put',
    data
  })
}

export const genTableDelete = (id: number | string) => {
  return request<unknown, ApiSpace.Result<boolean>>({
    url: '/tool/gen/' + id,
    method: 'delete'
  })
}

export const preview = (id: number | string) => {
  return request<unknown, ApiSpace.Result<Record<string, string>>>({
    url: '/tool/gen/preview/' + id,
    method: 'get'
  })
}

export const generateCode = (id: number | string) => {
  return request<unknown, Blob>({
    url: '/tool/gen/download?tableId=' + id,
    method: 'get',
    responseType: 'blob',
  })
}

export const batchGenerateCode = (ids: (number | string)[]) => {
  return request<unknown, Blob>({
    url: '/tool/gen/batchGenCode?tableIds=' + ids.join(','),
    method: 'get',
    responseType: 'blob',
  })
}

