import { TreeSelect } from '@/api/common/type'
import { TableData } from '@arco-design/web-vue'

export interface SysMenu extends TableData {
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

export interface SysMenuParam extends TableData {
  title?: string
  type?: string
  enabled?: boolean
}

export interface RoleMenuTreeSelect {
  menus: TreeSelect[]
  checkedKeys: number[]
}