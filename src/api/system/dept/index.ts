import request from '@/utils/request'
import { TreeSelect } from '../../common/type'
import { SysDept, SysDeptParam } from './type'

export const deptList = (params: SysDeptParam) => {
  return request<unknown, Promise<ApiSpace.Result<SysDept[]>>>({
    url: '/system/dept/list',
    method: 'get',
    params
  })
}

export const deptOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysDept>>>({
    url: '/system/dept/' + id,
    method: 'get'
  })
}

export const deptUpdate = (data: SysDept) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dept',
    method: 'put',
    data
  })
}

export const deptAdd = (data: SysDept) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dept',
    method: 'post',
    data
  })
}

export const deptDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/dept/' + id,
    method: 'delete'
  })
}

export const treeselect = (params: SysDeptParam) => request<unknown, Promise<ApiSpace.Result<TreeSelect[]>>>({ url: '/system/dept/treeselect', method: 'get', params })
