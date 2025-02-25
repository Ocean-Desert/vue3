import type { BaseEntity, BaseEntityParams } from '@/api/common/type'
import { SysMenu } from '../menus/type'

export interface SysRole extends BaseEntity {
  id?: number
  roleKey?: string
  roleName?: string
  dataScope?: string
  enabled?: boolean
  deptIds?: number[]
  menuIds?: number[]
  menuList?: SysMenu[]
}

export interface SysRoleParam extends BaseEntityParams {
  id?: number
  roleKey?: string
  roleName?: string
  dataScope?: string
  enabled?: boolean
}


