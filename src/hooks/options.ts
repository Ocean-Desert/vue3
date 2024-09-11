import type { TableData, TableInstance, SelectOptionData, TreeNodeData, RequestOption, FileItem } from '@arco-design/web-vue'
import { Message, Modal } from '@arco-design/web-vue'
import { Ref, reactive, ref, toRefs, toValue, onMounted, computed } from 'vue'
import lodash from 'lodash'
import { SysDictData } from '@/api/system/dict/type'
import { SysFile, TreeSelect, UploadOptions } from '@/api/common/type'
import { convertTree, to } from '@/utils'
import { AxiosProgressEvent } from 'axios'
import { useAppStore } from '@/store'
import { encryptData, type DecryptData, type EncryptData } from '@/utils/security'

export const useSecurityApi = (api: (data: EncryptData | any) => Promise<ApiSpace.Result<DecryptData | unknown>>, isEncrypt = true) => {
  const appStore = useAppStore()
  const keyPair = computed(() => {
    if (!appStore.security || Object.keys(appStore.security).length === 0) {
      appStore.initKeyPair()
    }
    return appStore.security
  })
  const execute = async (data?: any) => {
    if (isEncrypt) {
      const encrypt = await encryptData(data, appStore.publicKey)
      api(encrypt)
    } else {  
      api(data)
    }
  }
  return { keyPair, execute }
}
export const useDateRange = (model: ApiSpace.PageParams, options?: {
  beginTime?: string,
  endTime?: string,
  initValue?: any | any[]
}) => {
  const beginTime = options?.beginTime ?? 'beginTime'
  const endTime = options?.endTime ?? 'endTime'
  const initValue = options?.initValue ?? { [beginTime]: '', [endTime]: '' }
  if (!model.params) {
    model.params = { ...initValue }
  }
  const dateRange = computed({
    get: () => ([model.params[beginTime], model.params[endTime]]),
    set: (value: string[]) => {
      if (value) {
        model.params[beginTime] = value[0]
        model.params[endTime] = value[1]
      } else {
        model.params = { ...initValue }
      }
    }
  })
  return { dateRange }
}

export const useVisible = (initValue: boolean = false) => {
  const visible = ref(initValue)
  const setVisible = (value: boolean) => {
    visible.value = value
  }
  const toggle = () => {
    visible.value = !visible.value
  }
  return { visible, setVisible, toggle }
}

export const useUpload = (api: (form: FormData, options?: UploadOptions) => Promise<ApiSpace.Result<SysFile[]>>) => {
  const file = ref<FileItem>()
  const fileList = ref<FileItem[]>([])
  const fileRemove = (file: FileItem) => {
    return new Promise((resolve, reject) => {
      const list = fileList.value.filter(item => item.uid !== file.uid)
      if (fileList.value.length > list.length) {
        fileList.value = list
        resolve(true)
      } else {
        reject(false)
      }
    })
  }
  const upload = async (option: RequestOption): Promise<[Error, undefined] | [null, ApiSpace.Result<SysFile[]>]> => {
    const { onProgress, onError, onSuccess, fileItem, headers, action, data } = option
    const form = new FormData()
    form.append('file', fileItem.file as Blob)
    if (data) {
      Object.keys(data).forEach(item => {
        form.append(item, data[item])
      })
    }
    return await to<ApiSpace.Result<SysFile[]>>(api(form, {
      headers,
      action,
      onProgress: (event: AxiosProgressEvent) => {
        let percent: number = 0
        if (event.total && event.total > 0) {
          percent = event.loaded / event.total
        }
        onProgress(percent)
      }
    }))
  }
  const imageRequest = async (option: RequestOption) => {
    const [err, response] = await upload(option)
    if (!err) {
      if (response.success) {
        option.onSuccess(response)
        if (!response.data) return
        option.fileItem.status = 'done'
        file.value = { ...option.fileItem, url: response.data[response?.data?.length - 1]?.path }
      } else {
        option.onError(response)
        option.fileItem.status = 'error'
        Message.error(response.msg || '上传失败')
      }
    } else {
      console.error(err)
      option.onError(err)
    }
  }
  const imagesRequest = async (option: RequestOption) => {
    const [err, response] = await upload(option)
    if (!err) {
      if (response.success) {
        option.onSuccess(response)
        if (!response.data) return
        option.fileItem.status = 'done'
        fileList.value.push({ ...option.fileItem, url: response.data[response?.data?.length - 1]?.path })
      } else {
        option.onError(response)
        option.fileItem.status = 'error'
        Message.error(response.msg || '上传失败')
      }
    } else {
      console.error(err)
      option.onError(err)
    }
  }
  return { fileList, file, imageRequest, imagesRequest, fileRemove }
}

export const useTreeSelect = (api: () => Promise<ApiSpace.Result<TreeSelect[]>>, options?: { immediate?: boolean, callback?: (node: TreeNode) => TreeNode }) => {
  const isImmediate = options?.immediate ?? true
  const callback = options?.callback ? options.callback : (data: TreeNode) => ({ key: data.id, title: data.label })
  const loading = ref(false)
  const data = ref<TreeNodeData[]>([])
  const fetchData = async () => {
    loading.value = true
    data.value = []
    const [err, response] = await to<ApiSpace.Result<TreeSelect[]>>(api(), () => loading.value = false)
    if (!err) {
      if (response.success) {
        const treeData = response.data as TreeSelect[]
        data.value = convertTree(treeData, callback)
      }
    } else {
      console.error(err)
    }
  }
  onMounted(() => {
    isImmediate && fetchData()
  })
  return { loading, data, fetchData }
}

export const useDictSelectMultiple = (...apis: (() => Promise<ApiSpace.Result<SysDictData[]>>)[]): UseDictSelectResult[] => {
  const result: UseDictSelectResult[] = []
  apis.forEach(item => {
    result.push({
      loading: ref(false),
      options: ref<SelectOptionData[]>([]),
      defaultValue: ref(),
      fetchData: async () => { }
    })
  })
  const fetchDataAll = async () => {
    try {
      const responses: ApiSpace.Result<SysDictData[]>[] = await Promise.all(apis.map((api, index) => {
        result[index].loading.value = true
        return api()
      }))
      for (const index in result) {
        const response = responses[index]
        const sysDict = result[index]
        sysDict.fetchData = async () => {
          try {
            sysDict.loading.value = true
            sysDict.options.value = []
            const response = await apis[index]()
            if (response.success) {
              const dictionaries = response.data as SysDictData[]
              sysDict.options.value = dictionaries.map((item: SysDictData) => {
                if (item.isDefault) sysDict.defaultValue.value = item.dictValue
                return {
                  label: item.dictLabel,
                  value: item.dictValue,
                  disabled: item.enabled
                }
              })
            }
          } catch (e) {
            console.error(e)
          } finally {
            sysDict.loading.value = false
          }
        }
        const sysDictData = response.data as SysDictData[]
        sysDict.options.value = sysDictData.map((item: SysDictData) => {
          if (item.isDefault) sysDict.defaultValue.value = item.dictValue
          return {
            label: item.dictLabel,
            value: item.dictValue,
            tagProps: { style: item.dictStyle },
            disabled: item.enabled
          }
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      result.forEach((item) => {
        item.loading.value = false
      })
    }
  }
  onMounted(() => {
    fetchDataAll()
  })
  return result
}

export const useSelect = <S>(api: () => Promise<ApiSpace.Result<S[]>>, callback: (source: S[]) => SelectOptionData[], immediate?: boolean) => {
  const isImmediate = immediate ?? true
  const loading = ref(false)
  const data = ref<SelectOptionData[]>([])
  const fetchData = async () => {
    loading.value = true
    const [err, response] = await to<ApiSpace.Result<S[]>>(api(), () => loading.value = false)
    if (!err) {
      if (response.success) {
        const source = response.data as S[]
        data.value = callback(source)
      }
    } else {
      console.error(err)
    }
  }
  onMounted(() => {
    isImmediate && fetchData()
  })
  return { loading, data, fetchData }
}

export const useDictSelect = (api: () => Promise<ApiSpace.Result<SysDictData[]>>, immediate?: boolean): UseDictSelectResult => {
  const isImmediate = immediate ?? true
  const loading = ref(false)
  const options = ref<SelectOptionData[]>([])
  const defaultValue = ref()
  const fetchData = async () => {
    loading.value = true
    options.value = []
    const [err, response] = await to<ApiSpace.Result<SysDictData[]>>(api(), () => loading.value = false)
    if (!err) {
      if (response.success) {
        const dictionaries = response.data as SysDictData[]
        options.value = dictionaries.map((item: SysDictData) => {
          if (item.isDefault) defaultValue.value = item.dictValue
          return {
            label: item.dictLabel,
            value: item.dictValue,
            tagProps: { style: item.dictStyle },
            disabled: item.enabled
          }
        })
      }
    } else {
      console.error(err)
    }
  }
  onMounted(() => {
    isImmediate && fetchData()
  })
  return { fetchData, loading, options, defaultValue }
}
export type UseDictSelectResult = {
  fetchData: () => Promise<void>
  loading: Ref<boolean>
  options: Ref<SelectOptionData[]>
  defaultValue: Ref<any>
}

export const useTable = (api: ApiSpace.PageApi | ApiSpace.Api<TableData>, options: TableSpace.TableOptions<TableData>) => {
  const { formatResult, onSuccess, immediate, rowKey, isPagination } = options || {}
  const isImmediate = immediate ?? true
  const loading = ref(false)
  const tableData = ref<TableData[]>([])
  const selectKeys = ref<(number | string)[]>([])
  const { pagination, setTotal } = isPagination ? usePagination(() => fetchData()) : { pagination: false, setTotal: undefined }
  const fetchData = async () => {
    loading.value = true
    if (isPagination && pagination && setTotal) {
      const pageApi = api as ApiSpace.PageApi
      const [err, response] = await to<ApiSpace.Result<ApiSpace.PageResult<TableData>>>(pageApi({ page: pagination.current, size: pagination.pageSize }), () => loading.value = false)
      if (!err) {
        tableData.value = formatResult ? formatResult(response.data?.records) : (response.data?.records || [])
        setTotal(response.data?.totalRow as number)
        onSuccess && onSuccess()
      } else {
        console.error(err)
      }
    } else {
      const simpleApi = api as ApiSpace.Api<TableData>
      const [err, response] = await to<ApiSpace.Result<TableData | TableData[] | boolean | string | number | undefined>>(simpleApi(), () => loading.value = false)
      if (!err) {
        const data = response.data as TableData[]
        tableData.value = formatResult ? formatResult(data) : (data || [])
        onSuccess && onSuccess()
      } else {
        console.error(err)
      }
    }
  }
  isImmediate && fetchData()
  const select: TableInstance['onSelect'] = (rowKeys: (string | number)[], rowKey: string | number, record: TableData) => {
    selectKeys.value = rowKeys
  }
  const selectAll: TableInstance['onSelectAll'] = (checked: boolean) => {
    const key = rowKey ?? 'id'
    selectKeys.value = checked ? tableData.value.map((item) => item[key] as number | string) : []
  }
  const handleDelete = async (
    api: () => Promise<ApiSpace.Result<boolean>>,
    options?: { title?: string; content?: string; successTip?: string; showModel?: boolean }
  ): Promise<boolean | undefined> => {
    const onDelete = async () => {
      loading.value = true
      const [err, response] = await to<ApiSpace.Result<boolean>>(api(), () => loading.value = false)
      if (!err) {
        if (response.success) {
          Message.success(options?.successTip || '删除成功')
          selectKeys.value = []
          fetchData()
        } else {
          Message.error(response.msg)
        }
        return response.success
      } else {
        Message.error('接口异常：' + err)
        console.error(err)
        return false
      }
    }
    const flag = options?.showModel ?? true
    if (!flag) {
      return onDelete()
    }
    Modal.warning({
      title: options?.title || '删除提示',
      content: options?.content || '是否删除该数据',
      hideCancel: false,
      maskClosable: false,
      onBeforeOk: onDelete
    })
  }
  return { loading, tableData, fetchData, pagination, selectKeys, select, selectAll, handleDelete }
}

export const usePagination = (callback: PageSpace.Callback, options: PageSpace.PageOptions = { defaultPageSize: 10 }) => {
  const pagination = reactive({
    showTotal: true,
    showPageSize: true,
    total: 0,
    current: 1,
    pageSize: options.defaultPageSize,
    onChange: (current: number) => {
      pagination.current = current
      callback && callback()
    },
    onPageSizeChange: (pageSize: number) => {
      pagination.current = 1
      pagination.pageSize = pageSize
      callback && callback()
    }
  })
  const changeCurrent = pagination.onChange
  const changePageSize = pagination.onPageSizeChange
  const setTotal = (total: number) => {
    pagination.total = total
  }
  const { current, pageSize, total } = toRefs(pagination)
  return { current, pageSize, total, pagination, changeCurrent, changePageSize, setTotal }
}

export const useForm = (initValue: FormSpace.Options): UseFormResult => {
  const getInitValue = () => lodash.cloneDeep(initValue)
  const options = reactive<FormSpace.Options>(initValue)
  const resetOptions = () => {
    Object.assign(options, getInitValue())
  }

  const setValue = <T>(field: string, key: keyof FormSpace.CoulmnsItem, value: T) => {
    if (!options.columns.length) return
    const column = options.columns.find((item: FormSpace.CoulmnsItem) => item.field === field)
    if (column) {
      column[key] = value as never
    } else {
      console.warn(`找不到${field}属性`)
    }
  }
  const setPropsValue = <T>(field: string, key: keyof FormSpace.ColumnsItemPropsKey, value: T) => {
    if (!options.columns.length) return
    const column = options.columns.find((item: FormSpace.CoulmnsItem) => item.field === field)
    if (column) {
      if (!column.props) {
        column.props = {}
      }
      column.props[key as keyof FormSpace.CoulmnsItem['props']] = value as never
    } else {
      console.warn(`找不到${field}属性`)
    }
  }
  return { options, resetOptions, setValue, setPropsValue }
}
export type UseFormResult = {
  options: FormSpace.Options
  resetOptions: () => void
  setValue: <T>(field: string, key: keyof FormSpace.CoulmnsItem, value: T) => void
  setPropsValue: <T>(field: string, key: keyof FormSpace.ColumnsItemPropsKey, value: T) => void
}

export const useDisplay = (newOptions: Partial<TableSpace.DisplayOptions> = {}): Ref<TableSpace.DisplayOptions> => {
  const initialOptions: TableSpace.DisplayOptions = {
    showPage: true,
    showSearch: true,
    showModal: true,
    showBatchDel: true,
    showBatchEdit: true,
    showAdd: true,
    showDel: true,
    showEdit: true,
    modelTitle: '',
    placement: 'right',
  }
  return ref<TableSpace.DisplayOptions>({ ...initialOptions, ...toValue(newOptions) })
}

export const usePermission = (newOptions: Partial<TableSpace.PermissionOptions> = {}): Ref<TableSpace.PermissionOptions> => {
  const initialOptions: TableSpace.PermissionOptions = {
    add: ['*'],
    del: ['*'],
    edit: ['*'],
    query: ['*']
  }
  return ref<TableSpace.PermissionOptions>({ ...initialOptions, ...toValue(newOptions) })
}

