import { TableData } from '@arco-design/web-vue'

export interface SysDictTypeParams extends ApiSpace.PageParams {
  dictName?: string
  dictType?: string
  enabled?: boolean
}

export interface SysDictType extends TableData {
  dictCode?: number
  dictName?: string
  dictType?: string
  remark?: string
  enabled?: boolean
}

export interface SysDictDataParams extends ApiSpace.PageParams {
  dictLabel?: string
  dictValue?: string
  dictType?: string
  isDefault?: boolean
  enabled?: boolean
}

export interface SysDictData extends TableData {
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