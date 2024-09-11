import { computed, defineComponent, ref } from 'vue'
import { logininfoPage, logininfoDelete, clean } from '@/api/system/log/login'
import GenericComment from '@/components/generic/index'
import { SysLogininfoParams } from '@/api/system/log/login/type'
import { useDateRange, useDictSelect, useDisplay } from '@/hooks/options'
import { GenericInstance } from '@/types/generic'
import { dict } from '@/api/system/dict'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const loginStatusDict = useDictSelect(async () => dict('sys_login_status'))
  const genericRef = ref<GenericInstance>()
  const searchModel = ref<SysLogininfoParams>({})
  const { dateRange } = useDateRange(searchModel.value)
  const permission = ['system:logininfo:del']
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('login.index.935518-0'),
      field: 'username'
    }, {
      type: 'select',
      label: t('login.index.935518-1'),
      field: 'status',
      props: {
        loading: loginStatusDict.loading.value
      },
      options: loginStatusDict.options.value
    }, {
      type: 'customize',
      label: t('login.index.935518-2'),
      field: '',
      render: (value: object) => {
        return <a-range-picker v-model={dateRange.value} style="width: 300px;" size={size.value} />
      }
    }]
  }))
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('login.index.935518-3'),
      dataIndex: 'username',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: 'IP',
      dataIndex: 'ipaddr',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('login.index.935518-4'),
      dataIndex: 'address',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('login.index.935518-5'),
      dataIndex: 'browserName',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('login.index.935518-6'),
      dataIndex: 'browserVersion',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('login.index.935518-7'),
      dataIndex: 'clientType',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('login.index.935518-8'),
      dataIndex: 'systemType',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('login.index.935518-1'),
      dataIndex: 'status',
      align: 'center',
    },
    options: loginStatusDict.options.value
  }, {
    type: 'default',
    props: {
      title: t('login.index.935518-9'),
      dataIndex: 'msg',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('login.index.935518-10'),
      dataIndex: 'loginTime',
      align: 'center',
    }
  }]))
  const clear = () => {
    Modal.warning({
      title: t('login.index.935518-11'),
      content: t('login.index.935518-12'),
      hideCancel: false,
      maskClosable: false,
      onBeforeOk: onClear
    })
  }
  const onClear = async () => {
    const { success } = await clean()
    if (success) {
      Message.success(t('login.index.935518-13'))
      genericRef.value?.fetchData()
    } else {
      Message.error(t('login.index.935518-14'))
    }
  }
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        v-model={[searchModel.value, 'searchModel']}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={{ form: {}, columns: [] }}
        page={async (data: SysLogininfoParams) => await logininfoPage(data)}
        remove={async (id: number | string) => await logininfoDelete(id)}
        display={useDisplay({ showAdd: false, showBatchEdit: false }).value}
        permission={{
          del: ['system:logininfo:del'],
          query: ['system:logininfo:query']
        }}
      >
        {{
          'operate-left': () => (
            <a-button onClick={clear} v-permission={permission} type="primary" status="danger" size={size.value}>
              {{ icon: () => <icon-delete />, default: () => t('login.index.935518-15') }}
            </a-button>
          )
        }}
      </GenericComment>
    </>
  )
})