import type { BaseEntity, BaseEntityParams } from '@/api/common/type'
import { TableData } from '@arco-design/web-vue'

export interface SysConfig extends BaseEntity {
  id?: number
  name?: string
  key?: string
  value?: string
  type?: boolean
  remark?: string
}

export interface SysConfigParams extends BaseEntityParams {
  name?: string
  key?: string
  type?: boolean
}