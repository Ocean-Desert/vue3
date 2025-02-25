import { PropType, Ref, SetupContext, defineComponent, ref, watch, toValue, computed, toRef } from 'vue'
import SearchComponent from '@/components/search'
import FormComponent from '@/components/form'
import type * as Arco from '@arco-design/web-vue'
import style from './index.module.scss'
import { useDisplay, usePermission, useForm, useTable, UseFormResult } from '@/hooks/options'
import { useWindowSize } from '@vueuse/core'
import { isArray, isDate, isObject } from '@/utils/is'
import { hasProperty, to, uuid } from '@/utils'
import { Message, ValidatedError } from '@arco-design/web-vue'
import { useAppStore } from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { REDIRECT_ROUTE_NAME } from '@/router/constant'
import { useI18n } from 'vue-i18n'
import { AppFormInstance } from '@/types/form'

type LoadStates = {
  [id: string]: boolean
}

type FormTick = 'add' | 'edit'

const createFormModel = (options: FormSpace.CoulmnsItem[]): Arco.TableData | ApiSpace.PageParams => {
  const model: Arco.TableData | ApiSpace.PageParams = {}
  options.forEach((item: FormSpace.CoulmnsItem) => {
    console.log(item, 'item')

    if (hasProperty(item, 'defaultValue')) {
      model[item.field] = item.defaultValue
    } else {
      switch (item.fieldType) {
        case 'array': model[item.field] = []; break
        case 'object': model[item.field] = {}; break
        default: model[item.field] = null
      }
    }
  })
  return model
}

export default defineComponent((options: TableSpace.Options, context: SetupContext) => {
  const { width } = useWindowSize()
  const { slots, attrs, emit, expose } = context
  const appSotre = useAppStore()
  const router = useRouter()
  const route = useRoute()
  const size = computed(() => appSotre.size)
  const { t } = useI18n()
  const hideSearch = computed({
    get: () => {
      return appSotre.hideSearch && (options.display?.showSearch as boolean)
    },
    set: (value: boolean) => {
      appSotre.updateAppSetting({ hideSearch: value })
    }
  })
  const loadStates = ref<LoadStates>({})
  const editAlias = uuid()
  const delAlias = uuid()
  const form = ref<UseFormResult>(useForm(options.formOptions))
  const searchForm = ref<UseFormResult>(useForm(options.searchOptions))
  const formModelBind = options.formModel ? toRef(options, 'formModel', {}) : ref({ ...createFormModel(options.formOptions.columns) })
  const searchModelBind = options.searchModel ? toRef(options, 'searchModel', {}) : ref({ ...createFormModel(options.searchOptions.columns) })

  const formModel = computed<Arco.TableData>({
    get: () => formModelBind.value,
    set: (record: Arco.TableData) => {
      formModelBind.value = record
      options.formModel && emit('update:formModel', record)
    }
  })

  const searchModel = computed<ApiSpace.PageParams>({
    get: () => searchModelBind.value,
    set: (record: ApiSpace.PageParams) => {
      searchModelBind.value = record
      options.searchModel && emit('update:searchModel', record)
    }
  })

  const formTick: Ref<FormTick> = ref('add')

  const clearModel = (model: Ref<Arco.TableData | ApiSpace.PageParams>): void => {
    for (const key in model.value) {
      if (hasProperty(model.value, key)) {
        const value = model.value[key]
        if (isArray(value)) {
          (model.value[key] as any) = []
        } else if (isObject(value)) {
          (model.value[key] as any) = {}
        } else {
          (model.value[key] as any) = null
        }
      }
    }
  }
  const setModel = (model: Ref<Arco.TableData | ApiSpace.PageParams>, data: Partial<Arco.TableData | ApiSpace.PageParams>) => {
    model.value = { ...model.value, ...toValue(data) }
  }
  const setFormValue = <K extends keyof Arco.TableData>(field: K, value: Arco.TableData[K]) => {
    formModel.value[field] = value
  }
  const setSearchValue = <K extends keyof ApiSpace.PageParams>(field: K, value: ApiSpace.PageParams[K]) => {
    searchModel.value[field] = value
  }
  const { loading, tableData, fetchData, pagination, selectKeys, select, selectAll, handleDelete } =
    useTable(
      options.isPagination ?
        async (pagin: ApiSpace.PageParams) => await options?.page({ ...searchModel.value, page: pagin.page, size: pagin.size }) :
        async () => await options?.list({ ...searchModel.value }),
      { formatResult: options.formatResult, onSuccess: options.onSuccess, immediate: options.immediate, rowKey: options.rowKey, isPagination: options.isPagination }
    )

  const cloneColumns = ref<Arco.TableColumnData[]>([])
  const visible = ref(false)

  const formRef = ref<AppFormInstance>()
  const searchRef = ref<AppFormInstance>()
  const tableRef = ref<Arco.TableInstance>()

  const onSearch = () => {
    emit('search')
    searchForm.value?.resetOptions()
    fetchData()
  }
  const onReset = () => {
    emit('reset')
    searchForm.value?.resetOptions()
    clearModel(searchModel)
    fetchData()
  }
  const onSelect = (rowKeys: (string | number)[], rowKey: string | number, record: Arco.TableData) => {
    select(rowKeys, rowKey, record)
    emit('select', rowKeys, rowKey, record)
  }
  const onSelectAll= (checked: boolean) => {
    selectAll(checked)
    emit('selectAll', checked)
  }
  const onUpdateByKey = async () => {
    const key = selectKeys.value[selectKeys.value.length - 1]
    form.value?.resetOptions()
    if (options.get) {
      const [err, response] = await to<ApiSpace.Result<Arco.TableData>>(options.get(key))
      if (!err) {
        formModel.value = response.data as Arco.TableData
      }
    } else {
      formModel.value = tableData.value.find(item => selectKeys.value[selectKeys.value.length - 1] === item[options.rowKey as string]) as Arco.TableData
    }
    const column = options.columns.find(item => item.type === 'operate')
    column?.onUpdate && column.onUpdate(formModel.value)
    formTick.value = 'edit'
    visible.value = true
  }
  const onUpdate = async (value: Arco.TableData, column: TableSpace.Columns) => {
    loadStates.value[editAlias + value[options.rowKey as string]] = true
    form.value?.resetOptions()
    if (options.get) {
      const [err, response] = await to<ApiSpace.Result<Arco.TableData>>(options.get(value[options.rowKey as string] as (number | string)))
      if (!err) {
        formModel.value = response.data as Arco.TableData
      }
    } else {
      formModel.value = value as Arco.TableData
    }
    column.onUpdate && column.onUpdate(value)
    formTick.value = 'edit'
    visible.value = true
    loadStates.value[editAlias + value[options.rowKey as string]] = false
  }
  const onDelete = async (value: Arco.TableData, column: TableSpace.Columns) => {
    loadStates.value[delAlias + value[options.rowKey as string]] = true
    column.onDelete && column.onDelete(value)
    options.remove && await handleDelete(async () => await options?.remove(value[options.rowKey as string] as (number | string)))
    loadStates.value[delAlias + value[options.rowKey as string]] = false
  }
  const onDeletes = async () => {
    if (options.remove) {
      await handleDelete(async () => await options.remove(selectKeys.value.join()))
    }
  }
  const onAdd = async () => {
    emit('add')
    handleReset()
    formTick.value = 'add'
    visible.value = true
  }
  const handleUpdate = async (model: Record<string, any>) => {
    if (options.update) {
      const [err, response] = await to<ApiSpace.Result<boolean>>(options.update(model as Arco.TableData))
      if (!err) {
        if (response.success) {
          Message.success(t('global.message.success'))
          visible.value = false
          onReset()
        } else {
          Message.error(t('global.message.fail'))
        }
      }
    } else {
      throw Error('No update function set')
    }
  }
  const handleSave = async (model: Record<string, any>) => {
    console.log(model, 'handleSave')
    if (options.save) {
      const [err, response] = await to<ApiSpace.Result<boolean>>(options.save(model))
      if (!err) {
        if (response.success) {
          Message.success(t('global.message.success'))
          visible.value = false
          onReset()
        } else {
          Message.error(t('global.message.fail'))
        }
      }
    } else {
      throw Error('No save function set')
    }
  }
  const onSubmit = (data: { values: Record<string, any>; errors: Record<string, ValidatedError> | undefined }) => {
    if (data.errors) return
    formTick.value === 'add' ? handleSave(data.values) : handleUpdate(data.values)
  }
  const handleOk = (e: MouseEvent) => {
    form.value?.resetOptions()
    formRef.value?.formRef?.handleSubmit(e)
  }
  const handleReset = () => {
    form.value?.resetOptions()
    clearModel(formModel)
  }
  const multipleColumnsRender = (value: unknown[], options: Arco.SelectOption[] = []) => {
    if (value?.length > 0) {
      const nodes = options.map(option => {
        if (value.includes(option)) {
          return <a-tag color={option.tagProps?.style as string} size={size.value}>{option}</a-tag>
        } else if (value.includes((option as Arco.SelectOptionData)?.value)) {
          return <a-tag color={option.tagProps?.style as string} size={size.value}>{(option as Arco.SelectOptionData)?.label}</a-tag>
        } else if ((option as Arco.SelectOptionGroup)?.isGroup) {
          return multipleColumnsRender(value, (option as Arco.SelectOptionGroup).options)
        }
        return null
      }).filter(node => node !== null)
      if (nodes.length > 0) {
        return <a-space size={size.value}>{nodes}</a-space>
      }
    }
    return null
  }
  const chooseColumnsRender = (value: unknown, options: Arco.SelectOption[] = []) => {
    if (value != null && value != undefined) {
      for (const option of options) {
        if (option == value) {
          return <a-tag color={option.tagProps?.style as string} size={size.value}>{option}</a-tag>
        } else if ((option as Arco.SelectOptionData)?.value == value) {
          return <a-tag color={option.tagProps?.style as string} size={size.value}>{(option as Arco.SelectOptionData)?.label}</a-tag>
        } else if ((option as Arco.SelectOptionGroup)?.isGroup) {
          return chooseColumnsRender(value, (option as Arco.SelectOptionGroup)?.options)
        }
      }
    }
    return null
  }
  const operateColumnsRender = (record: Arco.TableData, column: TableSpace.Columns) => {
    return (
      <a-space size={size.value}>
        {options.display?.showEdit &&
          <a-tooltip content={t('global.generic.edit')}>
            <a-button onClick={() => onUpdate(record, column)} size={size.value} type="primary" status="success" loading={loadStates.value[editAlias + record[options.rowKey as string]]}>
              {{ icon: () => <icon-edit /> }}
            </a-button>
          </a-tooltip>
        }
        {options.display?.showDel &&
          <a-tooltip content={t('global.generic.remove')}>
            <a-button onClick={() => onDelete(record, column)} size={size.value} type="primary" status="danger" loading={loadStates.value[delAlias + record[options.rowKey as string]]}>
              {{ icon: () => <icon-delete /> }}
            </a-button>
          </a-tooltip>
        }
        {slots.operate && slots.operate(record)}
      </a-space>
    )
  }
  const initColumnsRender = (columns: TableSpace.Columns) => {
    columns.props.render = (data: { record: Arco.TableData, column: Arco.TableColumnData, rowIndex: number }) => {
      const { record, column, rowIndex } = data
      loadStates.value[editAlias + record[options.rowKey as string]] = false
      loadStates.value[delAlias + record[options.rowKey as string]] = false
      const value = column.dataIndex && record[column.dataIndex]
      switch (columns.type) {
        case 'choose': return chooseColumnsRender(value, columns.options)
        case 'multiple': return multipleColumnsRender(isArray(value) ? value : value?.split(','), columns.options)
        case 'image': return (
          <a-image-preview-group infinite>
            <a-space size={size.value}>
              {isArray(value) ? value.map((item: string, index: number) => <a-image key={index} src={item} width="100"></a-image>) : value?.split(',').map((item: string, index: number) => <a-image key={index} src={item} width="100"></a-image>)}
            </a-space>
          </a-image-preview-group>
        )
        case 'date': return <span>{isDate(value) ? new Date(value).toLocaleDateString('zh-CN') : value}</span>
        case 'time': return <span>{isDate(value) ? new Date(value).toLocaleString('zh-CN') : value}</span>
        case 'operate': return operateColumnsRender(record, columns)
      }
    }
  }
  watch(() => options.columns, (columns) => {
    cloneColumns.value = []
    for (const column of columns) {
      if (!column.props?.render && column.type !== 'default') initColumnsRender(column)
      cloneColumns.value.push(column.props)
    }
  }, {
    immediate: true
  })
  watch(() => options.searchOptions, (newValue) => {
    searchForm.value = useForm(newValue)
  }, { deep: true })
  watch(() => options.formOptions, (newValue) => {
    form.value = useForm(newValue)
  }, { deep: true })
  expose({
    getTableData: () => tableData.value,
    setVisible: (value: boolean) => visible.value = value,
    getVisible: () => visible.value,
    getFormTick: () => formTick.value,
    setFormTick: (value: FormTick) => formTick.value = value,
    getFormModel: () => ({ ...formModel.value }),
    getSearchModel: () => ({ ...searchModel.value }),
    setFormModel: (record: Partial<Arco.TableData>) => setModel(formModel, record),
    setSearchModel: (record: Partial<ApiSpace.PageParams>) => setModel(searchModel, record),
    setFormValue,
    setSearchValue,
    fetchData: () => fetchData(),
    handleDelete: (
      api: () => Promise<ApiSpace.Result<boolean>>,
      options?: { title?: string; content?: string; successTip?: string; showModel?: boolean }
    ) => handleDelete(api, options)
  })
  return () => (
    <>
      <a-card size={size.value}>
        {appSotre.search &&
          <div v-show={!hideSearch.value}>
            <SearchComponent
              ref={searchRef}
              onUpdate:modelValue={(data: ApiSpace.PageParams) => setModel(searchModel, data)}
              modelValue={searchModel.value}
              onSearch={onSearch}
              onReset={onReset}
              options={searchForm.value.options}
            />
            <a-divider />
          </div>
        }
        <a-row style="margin-bottom: 16px;">
          <a-col span={12}>
            <a-space size={size.value}>
              {options.display?.showAdd &&
                <a-button onClick={onAdd} size={size.value} v-permission={options.permission?.add} type="primary">
                  {{ icon: () => <icon-plus />, default: () => t('global.generic.add') }}
                </a-button>
              }
              {options.display?.showBatchEdit &&
                <a-button onClick={onUpdateByKey} size={size.value} v-permission={options.permission?.edit} type="primary" status="success" disabled={selectKeys.value.length !== 1}>
                  {{ icon: () => <icon-edit />, default: () => t('global.generic.edit') }}
                </a-button>
              }
              {options.display?.showBatchDel &&
                <a-button onClick={onDeletes} size={size.value} v-permission={options.permission?.del} type="primary" status="danger" disabled={selectKeys.value.length < 1}>
                  {{ icon: () => <icon-delete />, default: () => t('global.generic.remove') }}
                </a-button>
              }
              {slots['operate-left'] && slots['operate-left']()}
            </a-space>
          </a-col>
          <a-col span={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
            <a-space size={size.value}>
              {appSotre.search &&
                <a-tooltip content={hideSearch.value ? t('global.generic.showSearch') : t('global.generic.hideSearch')}>
                  <a-button onClick={() => hideSearch.value = !hideSearch.value} size={size.value} type="outline" shape="circle">
                    {hideSearch.value ? <icon-double-down /> : <icon-double-up />}
                  </a-button>
                </a-tooltip>
              }
              <a-tooltip content={t('global.generic.refreshPage')}>
                <a-button onClick={() => router.push({ name: REDIRECT_ROUTE_NAME, params: { path: route.fullPath } })} size={size.value} type="outline" shape="circle">
                  <icon-refresh />
                </a-button>
              </a-tooltip>
              {slots['operate-rigth'] && slots['operate-rigth']()}
            </a-space>
          </a-col>
        </a-row>
        <div class={style.containerTable}>
          <a-table
            ref={tableRef}
            rowKey={options.rowKey}
            rowSelection={options.isSelection && { type: 'checkbox', showCheckedAll: true, onlyCurrent: false }}
            loading={loading.value}
            data={tableData.value}
            pagination={pagination}
            columns={cloneColumns.value}
            onSelect={onSelect}
            onSelectAll={onSelectAll}
            size={size.value}
            {...options.props}
          >
            {{
              'th': slots['th'],
              'thead': slots['thead'],
              'empty': slots['empty'],
              'summary-cell': slots['summary-cell'],
              'pagination-right': slots['pagination-right'],
              'pagination-left': slots['pagination-left'],
              'tr': slots['tr'],
              'tbody': slots['tbody'],
              'drag-handle-icon': slots['drag-handle-icon'],
              'expand-row': slots['expand-row'],
              'expand-icon': slots['expand-icon'],
              'columns': slots['columns']
            }}
          </a-table>
        </div >
      </a-card >
      {options.display?.showModal && (slots.modal ? slots.modal() :
        <a-drawer
          title={options.display?.modelTitle || (formTick.value === 'add' ? t('global.generic.add') : t('global.generic.edit'))}
          unmountOnClose={true}
          v-model={[visible.value, 'visible']}
          placement={options.display?.placement}
          width={width.value > 600 ? 600 : '100%'}
          okButtonProps={{ size: size.value }}
          cancelButtonProps={{ size: size.value }}
        >
          {{
            default: () => (
              <FormComponent
                ref={formRef}
                onUpdate:modelValue={(data: Arco.TableData) => setModel(formModel, data)}
                modelValue={formModel.value}
                options={form.value?.options}
                onSubmit={onSubmit}
                onReset={handleReset}
              // onCancel={onCancel}
              >
              </FormComponent>
            ),
            footer: () => (
              <a-space size={size.value}>
                <a-popconfirm content={t('global.generic.tip.reset')} okText={t('global.generic.confirm')} cancelText={t('global.generic.cancel')} onOk={handleReset}>
                  <a-button size={size.value}>{t('global.generic.reset')}</a-button>
                </a-popconfirm>
                <a-button onClick={handleOk} type="primary" size={size.value}>{t('global.generic.submit')}</a-button>
              </a-space>
            )
          }}
        </a-drawer>
      )}
    </>
  )
}, {
  emits: ['add', 'search', 'reset', 'update:formModel', 'update:searchModel', 'select', 'selectAll'],
  props: {
    formModel: {
      type: Object as PropType<Arco.TableData>,
      required: false
    },
    searchModel: {
      type: Object as PropType<ApiSpace.PageParams>,
      required: false
    },
    props: {
      type: Object as PropType<Omit<Arco.TableInstance['$props'], 'columns' | 'data'>>,
      required: false
    },
    onSelect: {
      type: Function as PropType<(rowKeys: (string | number)[], rowKey: string | number, record: Arco.TableData) => void>,
      required: false
    },
    onSelectAll: {
      type: Function as PropType<(checked: boolean) => void>,
      required: false
    },
    onSearch: {
      type: Function as PropType<() => void>,
      required: false
    },
    onReset: {
      type: Function as PropType<() => void>,
      required: false
    },
    onAdd: {
      type: Function as PropType<() => void>,
      required: false
    },
    page: {
      type: Function as PropType<(params: ApiSpace.PageParams) => Promise<ApiSpace.Result<ApiSpace.PageResult<Record<string, any>>>>>,
      required: true
    },
    list: {
      type: Function as PropType<(params: Arco.TableData) => Promise<ApiSpace.Result<Record<string, any>[]>>>,
      required: true
    },
    save: {
      type: Function as PropType<(data: Arco.TableData) => Promise<ApiSpace.Result<boolean>>>,
      required: false
    },
    update: {
      type: Function as PropType<(data: Arco.TableData) => Promise<ApiSpace.Result<boolean>>>,
      required: false
    },
    get: {
      type: Function as PropType<(id: number | string) => Promise<ApiSpace.Result<Record<string, any>>>>,
      required: false
    },
    remove: {
      type: Function as PropType<(id: number | string) => Promise<ApiSpace.Result<boolean>>>,
      required: false
    },
    formatResult: {
      type: Function as PropType<(data: any[] | undefined) => any>,
      required: false
    },
    onSuccess: {
      type: Function as PropType<() => void>,
      required: false
    },
    formOptions: {
      type: Object as PropType<FormSpace.Options>,
      default: () => ({ form: {}, columns: [] }),
      required: true
    },
    searchOptions: {
      type: Object as PropType<FormSpace.Options>,
      default: () => ({ form: {}, columns: [] }),
      required: true
    },
    columns: {
      type: Array as PropType<TableSpace.Columns[]>,
      default: () => [],
      required: true
    },
    display: {
      type: Object as PropType<TableSpace.DisplayOptions>,
      default: () => (useDisplay().value),
      required: false
    },
    permission: {
      type: Object as PropType<TableSpace.PermissionOptions>,
      default: () => (usePermission().value),
      required: false
    },
    immediate: {
      type: Boolean as PropType<boolean>,
      default: true,
      required: false
    },
    isPagination: {
      type: Boolean as PropType<boolean>,
      default: true,
      required: false
    },
    isSelection: {
      type: Boolean as PropType<boolean>,
      default: true,
      required: false
    },
    rowKey: {
      type: String as PropType<string>,
      default: 'id',
      required: false
    }
  },
})

