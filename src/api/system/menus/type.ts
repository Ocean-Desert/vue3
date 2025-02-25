import { TreeSelect } from '@/api/common/type'
import type { BaseEntity, BaseEntityParams } from '@/api/common/type'

export interface SysMenu extends BaseEntity {
  id?: number
  parentId?: number
  name?: string
  title?: string
  permission?: string
  type?: string
  path?: string
  sort?: number
  component?: string
  icon?: string
  enabled?: boolean
  keepAlive?: boolean
  children?: SysMenu[]
}

export interface SysMenuParam extends BaseEntityParams {
  title?: string
  type?: string
  enabled?: boolean
}

export interface RoleMenuTreeSelect {
  menus: TreeSelect[]
  checkedKeys: number[]
}