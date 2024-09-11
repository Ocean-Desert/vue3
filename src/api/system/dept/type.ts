import { TableData } from '@arco-design/web-vue'
import { TreeSelect } from '../../common/type'

export interface SysDept extends TableData {
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

export interface SysDeptParam extends TableData {
  deptName?: string
  enabled?: boolean
}

export interface DeptTree {
  depts: TreeSelect[]
  checkedKeys: number[]
}