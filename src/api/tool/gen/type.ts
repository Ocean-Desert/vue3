import type { BaseEntity, BaseEntityParams } from '@/api/common/type'

export interface GenTableParams extends BaseEntityParams {
  tableName?: string
  tableDescribe?: string
}

export interface GenTableInfo {
  tableInfo: GenTable
  columns: GenTableColumn[]
  tables: GenTable[]
}

export interface GenTable extends BaseEntity {
  id?: number
  tableName?: string
  tableDescribe?: string
  className?: string
  packageName?: string
  moduleName?: string
  businessName?: string
  functionName?: string
  authorName?: string
  tablePrefix?: string
  sort?: number
  parentMenuId?: number
  pageMethod?: boolean
  listMethod?: boolean
  detailsMethod?: boolean
  addMethod?: boolean
  updateMethod?: boolean
  deleteMethod?: boolean
  isSwagger?: boolean
  isLombok?: boolean
  isValidation?: boolean
  isPermission?: boolean
  isTree?: boolean
  joinTables?: JoinTables[]
  treeOptions?: TreeOptions
  pkColumn?: GenTableColumn
  columns?: GenTableColumn[]
}

export interface GenTableColumn extends BaseEntity {
  id?: number
  tableId?: number
  columnName?: string
  columnDescribe?: string
  columnType?: string
  javaType?: string
  tsType?: string
  fieldName?: string
  isPk?: boolean
  isIncrement?: boolean
  isRequired?: boolean
  isInsert?: boolean
  isEdit?: boolean
  isList?: boolean
  isQuery?: boolean
  isMultiple?: boolean
  queryType?: QueryType
  htmlType?: HtmlType
  dictType?: string
  dictCustom?: string
  selectOptions?: SelectOptions
  sort?: number
}

export interface JoinTables {
  relationType?: RelationType
  selfField?: string
  targetField?: string
  targetTable?: string
  joinTable?: string
  joinSelfColumn?: string
  joinTargetColumn?: string
  relationTable?: GenTable
}

export interface SelectOptions { 
  targetTable: string
  labelColumn: string
  valueColumn: string
  relationTable?: GenTable
}

export interface TreeOptions {
  treeCode?: string
  treeName?: string
  treeParentCode?: string
}

export type QueryType = 'like' | 'like_left' | 'like_right' | 'not_like' | 'not_like_left' | 'not_like_right' | 'equals' | 'not_equals' | 'gt' | 'lt' | 'ge' | 'le' | 'is_null' | 'is_not_null' | 'in' | 'not_in' | 'between' | 'not_between'
export type HtmlType = 'input' | 'select' | 'radio-group' | 'checkbox-group' | 'textarea' | 'date-picker' | 'time-picker' | 'input-number' | 'input-password' | 'upload' | 'rate' | 'switch' | 'slider' | 'cascader' | 'tree-select'
export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'

