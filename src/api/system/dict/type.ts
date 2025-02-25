import type { BaseEntity, BaseEntityParams } from '@/api/common/type'

export interface SysDictTypeParams extends BaseEntityParams {
  dictName?: string
  dictType?: string
  enabled?: boolean
}

export interface SysDictType extends BaseEntity {
  dictCode?: number
  dictName?: string
  dictType?: string
  remark?: string
  enabled?: boolean
}

export interface SysDictDataParams extends BaseEntityParams {
  dictLabel?: string
  dictValue?: string
  dictType?: string
  isDefault?: boolean
  enabled?: boolean
}

export interface SysDictData extends BaseEntity {
  id?: number
  dictSort?: number
  dictLabel?: string
  dictValue?: string
  dictType?: string
  dictStyle?: string
  remark?: string
  isDefault?: boolean
  enabled?: boolean
}