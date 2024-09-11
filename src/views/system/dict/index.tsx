import { defineComponent, ref, computed } from 'vue'
import GenericComment from '@/components/generic/index'
import { dictOne, dictList, dictUpdate, dictAdd, dictDelete, refresh, dict, dictPage } from '@/api/system/dict'
import { useDictSelect } from '@/hooks/options'
import { SysDictType, SysDictTypeParams } from '@/api/system/dict/type'
import { to } from '@/utils'
import { Message, TableColumnData, TableData } from '@arco-design/web-vue'
import { GenericInstance } from '@/types/generic'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'


export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const genericRef = ref<GenericInstance>()
  const enabledDict = useDictSelect(async () => await dict('sys_enabled'))
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('dict.index.032619-0'),
      field: 'dictName'
    }, {
      type: 'input',
      label: t('dict.index.032619-1'),
      field: 'dictType'
    }, {
      type: 'select',
      label: t('dict.index.032619-2'),
      field: 'enabled',
      options: enabledDict.options.value,
      props: { loading: enabledDict.loading.value },
    }]
  }))
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('dict.index.032619-3'),
      dataIndex: 'dictCode',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('dict.index.032619-0'),
      dataIndex: 'dictName',
      align: 'center'
    }
  }, {
    type: 'default',
    props: {
      title: t('dict.index.032619-1'),
      dataIndex: 'dictType',
      align: 'center',
      render: (data: { record: TableData; column: TableColumnData; rowIndex: number; }) => (
        <RouterLink to={{ name: 'dictDataIndex', params: { dictId: data.record['dictCode'] } }}>{data.record['dictType']}</RouterLink>
      )
    }
  }, {
    type: 'default',
    props: {
      title: t('dict.index.032619-4'),
      dataIndex: 'remark',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('dict.index.032619-2'),
      dataIndex: 'enabled',
      align: 'center',
    },
    options: enabledDict.options.value
  }, {
    type: 'operate',
    props: {
      title: t('dict.index.032619-5'),
      align: 'center',
    }
  }]))
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { hide: true },
    columns: [{
      type: 'input',
      label: t('dict.index.032619-3'),
      field: 'dictCode',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('dict.index.032619-6'),
      field: 'dictName',
      rules: [{ required: true, message: t('dict.index.032619-7') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('dict.index.032619-1'),
      field: 'dictType',
      rules: [{ required: true, message: t('dict.index.032619-8') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('dict.index.032619-4'),
      field: 'remark',
      props: { allowClear: true }
    }, {
      type: 'switch',
      label: t('dict.index.032619-2'),
      field: 'enabled',
      span: 12
    }]
  }))
  const permission = ['system:dict:add']
  const refreshCahce = async () => {
    const [err, response] = await to<ApiSpace.Result<unknown>>(refresh())
    if (!err) {
      Message.success(t('dict.index.032619-9'))
      genericRef.value?.fetchData()
    }
  }
  return () => (
    <>
      <div>
        <GenericComment
          ref={genericRef}
          rowKey={'dictCode'}
          columns={columns.value}
          searchOptions={searchOptions.value}
          formOptions={formOptions.value}
          page={async (data: SysDictTypeParams) => await dictPage(data)}
          get={async (id: number | string) => await dictOne(id)}
          save={async (data: SysDictType) => await dictAdd(data)}
          update={async (data: SysDictType) => dictUpdate(data)}
          remove={async (id: number | string) => await dictDelete(id)}
          permission={{
            add: ['system:dict:add'],
            del: ['system:dict:del'],
            edit: ['system:dict:edit'],
            query: ['system:dict:query']
          }}
        >
          {{
            'operate-left': () => (
              <a-button v-permission={permission} onClick={refreshCahce} type="primary" status="warning" size={size.value}>
                {{ icon: () => <icon-refresh />, default: () => t('dict.index.032619-10') }}
              </a-button>
            )
          }}
        </GenericComment>
      </div>
    </>
  )
})