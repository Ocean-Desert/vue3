import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import GenericComment from '@/components/generic/index'
import { dictDataOne, dictOne, dictDataUpdate, dictDataAdd, dictDataDelete, dict, dictDataPage } from '@/api/system/dict'
import { SysDictData, SysDictDataParams } from '@/api/system/dict/type'
import { useDictSelect } from '@/hooks/options'
import { useRoute, useRouter } from 'vue-router'
import { GenericInstance } from '@/types/generic'
import { useTabBarStore } from '@/store'
import { TagProps } from '@/store/modules/tabBar/type'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const router = useRouter()
  const route = useRoute()
  const tabBarStore = useTabBarStore()
  const genericRef = ref<GenericInstance>()
  const dictType = ref('')
  const tagList = computed(() => (tabBarStore.getTagList))
  const enabledDict = useDictSelect(async () => await dict('sys_enabled'))
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('dict.data.664297-0'),
      field: 'dictLabel'
    }, {
      type: 'input',
      label: t('dict.data.664297-1'),
      field: 'dictValue'
    }, {
      type: 'select',
      label: t('dict.data.664297-2'),
      field: 'isDefault',
      options: [{ label: t('dict.data.664297-3'), value: false }, { label: t('dict.data.664297-4'), value: true }]
    }, {
      type: 'select',
      label: t('dict.data.664297-5'),
      field: 'enabled',
      options: enabledDict.options.value,
      props: { loading: enabledDict.loading.value },
    }]
  }))
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('dict.data.664297-0'),
      dataIndex: 'dictLabel',
      align: 'center'
    }
  }, {
    type: 'default',
    props: {
      title: t('dict.data.664297-1'),
      dataIndex: 'dictValue',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('dict.data.664297-6'),
      dataIndex: 'dictSort',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('dict.data.664297-7'),
      dataIndex: 'dictStyle',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('dict.data.664297-7'),
      dataIndex: 'remark',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('dict.data.664297-2'),
      dataIndex: 'isDefault',
      align: 'center',
    },
    options: [{ label: t('dict.data.664297-3'), value: false }, { label: t('dict.data.664297-4'), value: true }]
  }, {
    type: 'choose',
    props: {
      title: t('dict.data.664297-5'),
      dataIndex: 'enabled',
      align: 'center',
    },
    options: enabledDict.options.value
  }, {
    type: 'operate',
    props: {
      title: t('dict.data.664297-8'),
      align: 'center',
    }
  }]))
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { hide: true },
    columns: [{
      type: 'input',
      label: t('dict.data.664297-9'),
      field: 'id',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('dict.data.664297-0'),
      field: 'dictLabel',
      rules: [{ required: true, message: t('dict.data.664297-10') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('dict.data.664297-1'),
      field: 'dictValue',
      rules: [{ required: true, message: t('dict.data.664297-11') }],
      props: { allowClear: true }
    }, {
      type: 'input-number',
      label: t('dict.data.664297-6'),
      field: 'dictSort',
      rules: [{ required: true, message: t('dict.data.664297-12') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('dict.data.664297-7'),
      field: 'dictStyle',
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('dict.data.664297-13'),
      field: 'remark',
      props: { allowClear: true }
    }, {
      type: 'switch',
      label: t('dict.data.664297-2'),
      field: 'isDefault',
      span: 12,
    }, {
      type: 'switch',
      label: t('dict.data.664297-5'),
      field: 'enabled',
      span: 12,
    }]
  }))
  const fetchData = async () => {
    if (route.params.dictId) {
      const { data } = await dictOne(route.params.dictId as string)
      if (data) {
        dictType.value = data?.dictType as string
        genericRef.value?.fetchData()
      }
    }
  }
  const closeCurrent = () => {

    router.push({ name: 'dict' })
  }
  const closeOtherDuplicateTag = () => {
    tabBarStore.closeDuplicateTag(tagList.value)
  }
  onMounted(() => {
    closeOtherDuplicateTag()
    fetchData()
  })
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        immediate={false}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        page={async (data: SysDictDataParams) => await dictDataPage({ ...data, dictType: dictType.value })}
        get={async (id: number | string) => await dictDataOne(id)}
        save={async (data: SysDictData) => await dictDataAdd(data)}
        update={async (data: SysDictData) => dictDataUpdate(data)}
        remove={async (id: number | string) => await dictDataDelete(id)}
        permission={{
          add: ['system:dict:add'],
          del: ['system:dict:del'],
          edit: ['system:dict:edit'],
          query: ['system:dict:query']
        }}
      >
        {{
          'operate-left': () => (
            <a-button onClick={closeCurrent} type="primary" status="warning" size={size.value}>
              {{ icon: () => <icon-backward />, default: () => t('dict.data.664297-14') }}
            </a-button>
          )
        }}
      </GenericComment>
    </>
  )
})