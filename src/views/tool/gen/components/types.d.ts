import type { PropType } from 'vue'
import type { GenTable, GenTableColumn, JoinTables, GenTableInfo, SelectOptions } from '@/api/tool/gen/type'
import type { FormInstance } from '@arco-design/web-vue'

// JoinTable 组件实例类型
declare const _JoinTable: import('vue').DefineComponent<{
  modelValue: {
    type: PropType<JoinTables>
    required: true
    default: () => ({})
  }
  sourceColumns: {
    type: PropType<GenTableColumn[]>
    default: () => []
  }
  targetTables: {
    type: PropType<Record<string, GenTableColumn[]>>
    default: () => ({})
  }
}, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
  'update:modelValue': (value: JoinTables) => true
}, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
  modelValue?: JoinTables
  sourceColumns?: GenTableColumn[]
  targetTables?: Record<string, GenTableColumn[]>
}>, {
  validate: () => Promise<boolean>
}>

// BasicInfo 组件实例类型
declare const _BasicInfo: import('vue').DefineComponent<{
  modelValue: {
    type: PropType<GenTable>
    required: true
    default: () => ({})
  }
}, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
  'update:modelValue': (value: GenTable) => true
}, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
  modelValue?: GenTable
}>, {
  validate: () => Promise<boolean>
}>

// ColumnsInfo 组件实例类型
declare const _ColumnsInfo: import('vue').DefineComponent<{
  modelValue: {
    type: PropType<GenTableInfo>
    default: () => ({
      tableInfo: {},
      columns: [],
      tables: []
    })
  }
}, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
  'update:modelValue': (value: GenTableInfo) => true
}, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
  modelValue?: GenTableInfo
}>, {}>

// GenInfo 组件实例类型
declare const _GenInfo: import('vue').DefineComponent<{
  modelValue: {
    type: PropType<GenTable>
    required: true
    default: () => ({})
  }
  joinTables: {
    type: PropType<GenTable[]>
    default: () => []
  }
}, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
  'update:modelValue': (value: GenTable) => true
}, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
  modelValue?: GenTable
  joinTables?: GenTable[]
}>, {
  validate: () => Promise<boolean>
}>

// SelectOptions 组件实例类型
declare const _SelectOptions: import('vue').DefineComponent<{
  modelValue: {
    type: PropType<SelectOptions>
    required: false
  }
  options: {
    type: PropType<Record<string, string[]>>
    required: false
    default: () => ({})
  }
  width: {
    type: PropType<string | number>
    default: '400px'
  }
}, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
  'submit': (value: SelectOptions) => true
  'clear': () => true
}, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
  modelValue?: SelectOptions
  options?: Record<string, string[]>
  width?: string | number
}>, {
  options: Record<string, string[]>
  width: string | number
}>

export declare type JoinTableInstance = InstanceType<typeof _JoinTable>
export declare type BasicInfoInstance = InstanceType<typeof _BasicInfo>
export declare type ColumnsInfoInstance = InstanceType<typeof _ColumnsInfo>
export declare type GenInfoInstance = InstanceType<typeof _GenInfo>
export declare type SelectOptionsInstance = InstanceType<typeof _SelectOptions> 