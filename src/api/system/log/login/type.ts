import type { BaseEntity, BaseEntityParams } from '@/api/common/type'

export interface SysLogininfo extends BaseEntity {
  id?: number
  username?: string
  ipaddr?: string
  address?: string
  browserName?: string
  browserVersion?: string
  clientType?: string
  systemType?: string
  status?: string
  msg?: string
  loginTime?: string
  params?: any
}

export interface SysLogininfoParams extends BaseEntityParams {
  username?: string
  status?: string
  params?: any
}