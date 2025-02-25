import type { BaseEntity, BaseEntityParams } from '@/api/common/type'
import { TreeSelect } from '../../common/type'

export interface SysDept extends BaseEntity {
  deptId?: number
  parentId?: number
  ancestors?: string
  deptName?: string
  sort?: number
  enabled?: boolean
  parentName?: string
  remark?: string
  children?: SysDept[]
}

export interface SysDeptParam extends BaseEntityParams {
  deptName?: string
  enabled?: boolean
}

export interface DeptTree {
  depts: TreeSelect[]
  checkedKeys: number[]
}