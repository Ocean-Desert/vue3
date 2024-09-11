import { SysDept } from '@/api/system/dept/type'
import { SysMenu } from '@/api/system/menus/type'

export interface UserInfo {
  permissions: string[],
  roles: string[],
  userDetails: User,
}

export interface User {
  id?: number,
  username?: string,
  phone?: string,
  nickName?: string,
  sex?: string,
  avatar?: string,
  loginTime?: string,
  createTime?: string,
  enabled?: boolean,
  roles?: number[],
  sysDept?: SysDept,
  roleList?: SysRole[],
}

export interface SysRole {
  id?: number,
  roleName?: string,
  roleNameZh?: string,
  enabled?: boolean,
  menuList: SysMenu[],
}
