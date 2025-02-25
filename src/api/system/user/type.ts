import type { BaseEntity, BaseEntityParams } from '@/api/common/type'
import { SysDept } from '../dept/type'

export interface SysUser extends BaseEntity {
  id?: number
  deptId?: number
  userId?: number
  username?: string
  password?: string
  nickName?: string
  avatar?: string
  sex?: string
  phone?: string
  email?: string
  loginIp?: string
  loginTime?: string
  enabled?: boolean
  createTime?: string
  sysDept?: SysDept
}

export interface SysUserParam extends BaseEntityParams {
  id?: number
  username?: string
  sex?: string
  nickName?: string
  phone?: string
  beginTime?: string
  endTime?: string
  enabled?: boolean
  deptId?: number
}

