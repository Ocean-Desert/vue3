import request from '@/utils/request'
import type { SysRoleParam, SysRole } from './type'
import { DeptTree } from '../dept/type'

export const roleList = (params: SysRoleParam) => request<unknown, Promise<ApiSpace.Result<SysRole[]>>>({ url: '/system/role/list', method: 'get', params })

export const rolePage = (params: SysRoleParam) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysRole[]>>>>({
    url: '/system/role/page',
    method: 'get',
    params
  })
}

export const roleOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysRole>>>({
    url: '/system/role/' + id,
    method: 'get'
  })
}

export const roleUpdate = (data: SysRole) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/role',
    method: 'put',
    data
  })
}

export const roleAdd = (data: SysRole) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/role',
    method: 'post',
    data
  })
}

export const roleDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/role/' + id,
    method: 'delete'
  })
}

export const deptTree = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<DeptTree>>>({
    url: '/system/role/deptTree/' + id,
    method: 'get'
  })
}

export const dataScope = (data: SysRole) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/role/dataScope',
    method: 'put',
    data
  })
}