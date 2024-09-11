import { Ref, computed, ref, toValue, unref, watch } from 'vue'

export const useList = <Q, T>({ url, transform, immediate = true }: ListApi<Q>) => {
  const data = ref<T[]>([])
  const page = ref<number | string>(1)
  const size = ref<number | string>(10)
  const total = ref<number | string>(0)
  const query = ref<Q>() as Ref<Q>
  const payload = computed(() => {
    const queryData = transform ? transform(unref(query)) : query.value
    return Object.assign({}, queryData, {
      page: page.value,
      size: size.value
    })
  })
  const loadData = async () => { }
  const search = () => {
    page.value = 1
    data.value = []
    loadData()
  }
  immediate && loadData()
  return { query, page, size, total, data, loadData, search }
}

export const useDetail = ({ url, immediate = true }: DetailApi) => {
  const id = ref<number | string>()
  const data = ref({})
  const loadDetail = async () => {
    // TODO: 请求api及赋值
  }
  immediate && watch(() => id, () => loadDetail)
  return { id, data, loadDetail }
}

export const useUpdate = <T>({ url, transform, type }: UpdateApi<T>) => {
  const form = ref<T>() as Ref<T>
  const payload = computed(() => {
    return transform ? transform(unref(form)) : form.value
  })
  const submit = async () => {
    if (type === UpdateType.POST) {

    } else {

    }
  }
  return { form, submit }
}

type ListApi<Q> = { url: string, transform: (query: Q) => Q, immediate: boolean }
type DetailApi = { url: string, immediate: boolean }
type UpdateApi<T> = { url: string, transform: (form: T) => void, type: UpdateType }
type PageParam = { page: number | string, size: number | string }

export enum UpdateType { POST, PUT }

