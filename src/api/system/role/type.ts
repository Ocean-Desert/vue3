import { TableData } from '@arco-design/web-vue'
import { SysMenu } from '../menus/type'

export interface SysRole extends TableData {
  id?: number
  roleKey?: string
  roleName?: string
  dataScope?: string
  enabled?: boolean
  deptIds?: number[]
  menuIds?: number[]
  menuList?: SysMenu[]
}

export interface SysRoleParam extends ApiSpace.PageParams {
  id?: number
  roleKey?: string
  roleName?: string
  dataScope?: string
  enabled?: boolean
}


