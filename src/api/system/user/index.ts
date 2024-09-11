import request from '@/utils/request'
import type { SysUserParam, SysUser } from './type'

export const userList = (params: SysUserParam) => {
  return request<unknown, Promise<ApiSpace.Result<SysUser[]>>>({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

export const userPage = (params: SysUserParam) => {
  return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysUser>>>>({
    url: '/system/user/page',
    method: 'get',
    params
  })
}


export const userOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysUser>>>({
    url: '/system/user/' + id,
    method: 'get'
  })
}

export const userUpdate = (data: SysUser) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/user',
    method: 'put',
    data
  })
}

export const userAdd = (data: SysUser) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/user',
    method: 'post',
    data
  })
}

export const userDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/user/' + id,
    method: 'delete'
  })
}