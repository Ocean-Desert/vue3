import { TableData } from '@arco-design/web-vue'
import { SysDept } from '../dept/type'

export interface SysUser extends TableData {
  id?: number
  deptId?: number
  userId?: number
  username?: string
  password?: string
  nickName?: string
  avatar?: string
  sex?: string
  phone?: string
  loginIp?: string
  loginTime?: string
  enabled?: boolean
  createTime?: string
  sysDept?: SysDept
}

export interface SysUserParam extends ApiSpace.PageParams {
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

