import type { PropType } from 'vue'

declare const _default: import('vue').DefineComponent<{
  formModel: {
    type: PropType<import('@arco-design/web-vue').TableData>
  },
  searchModel: {
    type: PropType<ApiSpace.PageParams>
  },
  props: {
    type: PropType<Omit<import('@arco-design/web-vue').TableInstance['$props'], 'columns' | 'data'>>
  },
  onSelect: {
    type: PropType<(rowKeys: (string | number)[], rowKey: string | number, record: import('@arco-design/web-vue').TableData) => void>
  },
  onSelectAll: {
    type: PropType<(checked: boolean) => void>
  },
  onAdd: {
    type: PropType<() => void>
  },
  onSearch: {
    type: PropType<() => void>
  },
  onReset: {
    type: PropType<() => void>
  },
  page: {
    type: PropType<(params: ApiSpace.PageParams) => Promise<ApiSpace.Result<ApiSpace.PageResult<Record<string, any>>>>>
  },
  list: {
    type: PropType<(params: import('@arco-design/web-vue').TableData) => Promise<ApiSpace.Result<Record<string, any>[]>>>
  },
  save: {
    type: PropType<(data: import('@arco-design/web-vue').TableData) => Promise<ApiSpace.Result<boolean>>>
  },
  update: {
    type: PropType<(data: import('@arco-design/web-vue').TableData) => Promise<ApiSpace.Result<boolean>>>
  },
  get: {
    type: PropType<(id: number | string) => Promise<ApiSpace.Result<Record<string, any>>>>
  },
  remove: {
    type: PropType<(id: number | string) => Promise<ApiSpace.Result<boolean>>>
  },
  formatResult: {
    type: PropType<(data: any[] | undefined) => any>
  },
  onSuccess: {
    type: PropType<() => void>
  },
  formOptions: {
    type: PropType<FormSpace.Options>,
    default: () => ({ form: {}, columns: [] })
  },
  searchOptions: {
    type: PropType<FormSpace.Options>,
    default: () => ({ form: {}, columns: [] })
  },
  columns: {
    type: PropType<TableSpace.Columns[]>,
    default: () => [],
  },
  display: {
    type: PropType<TableSpace.DisplayOptions>,
    default: () => ({
      showPage: true,
      showSearch: true,
      showModel: true,
      showBatchDel: true,
      showBatchEdit: true,
      showAdd: true,
      showDel: true,
      showEdit: true,
      modelTitle: '',
      placement: 'right',
    })
  },
  permission: {
    type: PropType<TableSpace.PermissionOptions>,
    default: () => ({
      add: ['*'],
      del: ['*'],
      edit: ['*'],
      query: ['*']
    })
  },
  immediate: {
    type: BooleanConstructor
    default: boolean
  },
  isPagination: {
    type: BooleanConstructor
    default: boolean
  },
  isSelection: {
    type: BooleanConstructor
    default: boolean
  },
  rowKey: {
    type: StringConstructor
    default: string
  },
}, {
  render: () => JSX.Element
}, unknown, {},
  {
    handleDelete(
      api: () => Promise<ApiSpace.Result<boolean>>,
      options?: { title?: string; content?: string; successTip?: string; showModel?: boolean }
    ): void
    getTableData(): import('@arco-design/web-vue').TableData[]
    fetchData(): void
    setVisible(value: boolean): void
    getVisible(): boolean
    setFormTick(value: 'add' | 'edit'): void
    getFormTick(): 'add' | 'edit'
    getSearchModel(): ApiSpace.PageParams
    getFormModel(): import('@arco-design/web-vue').TableData
    setFormModel(record: Partial<import('@arco-design/web-vue').TableData>): void
    setSearchModel(record: Partial<ApiSpace.PageParams>): void
    setFormValue<K extends keyof import('@arco-design/web-vue').TableData>(field: K, value: import('@arco-design/web-vue').TableData[K]): void
    setSearchValue<K extends keyof ApiSpace.PageParams>(field: K, value: ApiSpace.PageParams[K]): void
  }, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    'update:searchModel': (value: ApiSpace.PageParams) => true
    'update:formModel': (value: import('@arco-design/web-vue').TableData) => true
    add: () => true
  }, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
    rowKey?: unknown
    immediate?: unknown
    columns: unknown
    formOptions: unknown
    searchOptions: unknown
    display?: unknown
    permission?: unknown
    props?: unknown
    isSelection?: unknown
    formatResult?: unknown
    onSuccess?: unknown
    page?: unknown
    list?: unknown
    get?: unknown
    save?: unknown
    update?: unknown
    remove?: unknown
    onSelect?: unknown
    onSelectAll?: unknown
    onAdd?: unknown
    onSearch?: unknown
    onReset?: unknown
    formModel?: unknown
    searchModel?: unknown
    isPagination?: unknown
  }>, {}>

export default _default