
declare namespace CommonSpace {
  type Size = 'mini' | 'small' | 'medium' | 'large'
}

declare namespace PageSpace {
  type Callback = () => void
  type PageOptions = { defaultPageSize: number }
}

declare namespace TableSpace {

  interface TableOptions<T> {
    formatResult?: (data: T[] | undefined) => any
    onSuccess?: () => void
    immediate?: boolean
    isPagination?: boolean
    rowKey?: keyof T
  }

  interface PermissionOptions {
    add?: string[] // 新增按钮权限
    del?: string[] // 删除按钮权限
    edit?: string[] // 编辑按钮权限
    query?: string[] // 查询按钮权限
  }

  interface DisplayOptions {
    showPage: boolean // 分页显示
    showSearch: boolean // 分页显示
    showModal: boolean // 弹框显示
    showBatchDel: boolean // 批量删除显示
    showBatchEdit: boolean // 批量编辑显示
    showAdd: boolean // 增加按钮显示
    showDel: boolean // 删除按钮显示
    showEdit: boolean // 编辑按钮显示
    modelTitle: string // 弹框标题
    placement: 'left' | 'right' // 弹框标题
  }

  type Type =
    | 'default' // 默认
    | 'choose' // 选择
    | 'multiple' // 多选
    | 'avatar' // 头像
    | 'image' // 图片
    | 'date' // 日期
    | 'time' // 时间
    | 'operate' // 操作

  interface Columns {
    type: Type // 类型
    props: import('@arco-design/web-vue').TableColumnData
    options?: import('@arco-design/web-vue').SelectInstance['$props']['options'] // 多选框的数据
    onUpdate?: (data: import('@arco-design/web-vue').TableInstance['$data']) => void // 更新函数
    onDelete?: (data: import('@arco-design/web-vue').TableInstance['$data']) => void // 删除函数
  }

  interface Options {
    rowKey?: string,
    immediate?: boolean,
    columns: Columns[]
    formOptions: FormSpace.Options
    searchOptions: FormSpace.Options
    display?: DisplayOptions
    permission?: PermissionOptions
    // data?: import('@arco-design/web-vue').TableInstance['$props']['data']
    props?: Omit<import('@arco-design/web-vue').TableInstance['$props'], 'columns' | 'data'>
    isSelection?: boolean
    formatResult?: (data: import('@arco-design/web-vue').TableData[] | undefined) => any
    onSuccess?: () => void
    page?: (params: ApiSpace.PageParams) => Promise<Result<PageResult<import('@arco-design/web-vue').TableData>>>
    list?: (params: import('@arco-design/web-vue').TableData) => Promise<Result<import('@arco-design/web-vue').TableData[]>>
    get?: (id: number | string) => Promise<Result<import('@arco-design/web-vue').TableData>>
    save?: (data: import('@arco-design/web-vue').TableData) => Promise<Result<boolean>>
    update?: (data: import('@arco-design/web-vue').TableData) => Promise<Result<boolean>>
    remove?: (id: number | string) => Promise<Result<boolean>>
    onAdd?: () => void
    onSearch?: () => void
    onReset?: () => void
    formModel?: import('@arco-design/web-vue').TableData
    searchModel?: ApiSpace.PageParams
    isPagination?: boolean
  }
}

declare namespace FormSpace {
  type Type =
    | 'input' // 输入框
    | 'select' // 下拉
    | 'radio-group' // 单选
    | 'checkbox-group' // 单选
    | 'textarea' // 文本域
    | 'date-picker' // 日期选择
    | 'time-picker' // 时间选择
    | 'input-number' // 数字输入框
    | 'input-password' // 密码
    | 'upload' // 上传
    | 'rate' // 评分
    | 'switch' // 开关
    | 'slider' // 滑动条
    | 'cascader' // 联级选择
    | 'tree-select' // 树选择
    | 'customize' // 自定义

  type ColumnsItemPropsKey =
    | keyof import('@arco-design/web-vue').InputInstance['$props']
    | keyof import('@arco-design/web-vue').SelectInstance['$props']
    | keyof import('@arco-design/web-vue').RadioGroupInstance['$props']
    | keyof import('@arco-design/web-vue').CheckboxGroupInstance['$props']
    | keyof import('@arco-design/web-vue').TextareaInstance['$props']
    | keyof import('@arco-design/web-vue').DatePickerInstance['$props']
    | keyof import('@arco-design/web-vue').TimePickerInstance['$props']
    | keyof import('@arco-design/web-vue').InputNumberInstance['$props']
    | keyof import('@arco-design/web-vue').UploadInstance['$props']
    | keyof import('@arco-design/web-vue').RateInstance['$props']
    | keyof import('@arco-design/web-vue').SwitchInstance['$props']
    | keyof import('@arco-design/web-vue').SliderInstance['$props']
    | keyof import('@arco-design/web-vue').CascaderInstance['$props']
    | keyof import('@arco-design/web-vue').TreeSelectInstance['$props']

  type CoulmnsItemHide = boolean | ((form?: any) => boolean)

  interface CoulmnsItem {
    type: Type,
    label: import('@arco-design/web-vue').FormItemInstance['label']
    field: import('@arco-design/web-vue').FormItemInstance['field']
    fieldType?: 'object' | 'array' | 'null'
    defaultValue?: any
    span?: number
    col?: import('@arco-design/web-vue').ColProps
    item?: Omit<import('@arco-design/web-vue').FormItemInstance['$props'], 'label' | 'field'>
    props?:
    | import('@arco-design/web-vue').InputInstance['$props']
    | import('@arco-design/web-vue').SelectInstance['$props']
    | import('@arco-design/web-vue').RadioGroupInstance['$props']
    | import('@arco-design/web-vue').CheckboxGroupInstance['$props']
    | import('@arco-design/web-vue').TextareaInstance['$props']
    | import('@arco-design/web-vue').DatePickerInstance['$props']
    | import('@arco-design/web-vue').TimePickerInstance['$props']
    | import('@arco-design/web-vue').InputPasswordInstance['$props']
    | import('@arco-design/web-vue').InputNumberInstance['$props']
    | import('@arco-design/web-vue').UploadInstance['$props']
    | import('@arco-design/web-vue').RateInstance['$props']
    | import('@arco-design/web-vue').SwitchInstance['$props']
    | import('@arco-design/web-vue').SliderInstance['$props']
    | import('@arco-design/web-vue').CascaderInstance['$props']
    | import('@arco-design/web-vue').TreeSelectInstance['$props']
    slots?: {}
    rules?: import('@arco-design/web-vue').FormItemInstance['$props']['rules']
    options?:
    | import('@arco-design/web-vue').SelectInstance['$props']['options']
    | import('@arco-design/web-vue').RadioGroupInstance['$props']['options']
    | import('@arco-design/web-vue').CheckboxGroupInstance['$props']['options']
    | import('@arco-design/web-vue').CascaderInstance['$props']['options']
    data?: import('@arco-design/web-vue').TreeSelectInstance['$props']['data']
    hide?: CoulmnsItemHide
    render?: (value: any) => VNodeChild
  }

  interface Options {
    form: Omit<import('@arco-design/web-vue').FormInstance['$props'], 'model'>
    columns: CoulmnsItem[]
    row?: Partial<typeof import('@arco-design/web-vue')['Row']['__defaults']>
    btns?: { hide?: boolean; cancelHide?: boolean; resetHide?: boolean; submitHide?: boolean; span?: number; col?: import('@arco-design/web-vue').ColProps }
    fold?: { enable?: boolean; index?: number }
  }
}

declare namespace ApiSpace {
  type Params<T> = { [key?: keyof T]: any }
  type Result<T = import('@arco-design/web-vue').TableData> = {
    status: number,
    success: boolean,
    msg: string,
    data?: T,
  }
  type PageResult<T> = {
    records: T[]
    pageNumber: number
    pageSize: number
    totalPage: number
    totalRow: number
  }
  type PageApi = (params: PageParams) => Promise<Result<PageResult<import('@arco-design/web-vue').TableData>>>
  type Api<T = import('@arco-design/web-vue').TableData> = (params?: Params<T>) => Promise<Result<T | T[] | boolean | string | number | undefined>>
  interface PageParams {
    page?: number
    size?: number
    [name: string]: any
  }
}

declare interface TreeNode {
  [key: string]: any
  children?: TreeNode[]
}

declare interface LocaleModule {
  default: Record<string, string>
}