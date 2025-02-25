import request from '@/utils/request'
import { RoleMenuTreeSelect, SysMenu, SysMenuParam } from './type'
import { TreeSelect } from '../../common/type'

export const menuList = (params: SysMenuParam) => {
  return request<unknown, Promise<ApiSpace.Result<SysMenu[]>>>({
    url: '/system/menu/list',
    method: 'get',
    params
  })
}

// export const menuPage = (params: SysMenuParam) => {
//   return request<unknown, Promise<ApiSpace.Result<ApiSpace.PageResult<SysMenu[]>>>>({
//     url: '/system/menu/page',
//     method: 'get',
//     params
//   })
// }

export const menuOne = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<SysMenu>>>({
    url: '/system/menu/' + id,
    method: 'get'
  })
}

export const menuUpdate = (data: SysMenu) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/menu',
    method: 'put',
    data
  })
}

export const menuAdd = (data: SysMenu) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/menu',
    method: 'post',
    data
  })
}

export const menuDelete = (id: number | string) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/menu/' + id,
    method: 'delete'
  })
}

export const menus = () => {
  return request<unknown, Promise<ApiSpace.Result<SysMenu[]>>>({
    url: '/system/menu',
    method: 'get'
  })
}

export const roleMenuTreeselect = (roleId: number) => {
  return request<unknown, ApiSpace.Result<RoleMenuTreeSelect>>({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get',
  })
}

export const menuTreeselect = (params: SysMenuParam) => {
  return request<unknown, Promise<ApiSpace.Result<TreeSelect[]>>>({
    url: '/system/menu/treeselect',
    method: 'get',
    params
  })
}