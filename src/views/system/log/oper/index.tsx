import { computed, defineComponent, ref } from 'vue'
import { logOne, logPage, logDelete, clean } from '@/api/system/log/oper'
import GenericComment from '@/components/generic/index'
import { SysLog, SysLogParams } from '@/api/system/log/oper/type'
import { Message, Modal, TableColumnData, TableData } from '@arco-design/web-vue'
import { useDateRange, useDisplay, useVisible } from '@/hooks/options'
import { useWindowSize, useClipboard } from '@vueuse/core'
import { GenericInstance } from '@/types/generic'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const { width } = useWindowSize()
  const { text, copy, copied, isSupported } = useClipboard()
  const { visible, setVisible, toggle } = useVisible()
  const genericRef = ref<GenericInstance>()
  const model = ref<SysLog>()
  const searchModel = ref<SysLogParams>({})
  const { dateRange } = useDateRange(searchModel)
  const permission = ['system:operlog:del']
  const details = computed(() => (
    [{
      label: t('oper.index.137217-0'),
      value: model.value?.id,
    }, {
      label: t('oper.index.137217-1'),
      value: model.value?.operName,
    }, {
      label: 'IP',
      value: model.value?.ipaddr,
    }, {
      label: t('oper.index.137217-2'),
      value: model.value?.address,
    }, {
      label: t('oper.index.137217-3'),
      value: model.value?.serverAddress,
    }, {
      label: t('oper.index.137217-4'),
      value: model.value?.method,
    }, {
      label: t('oper.index.137217-5'),
      value: model.value?.methodName,
    }, {
      label: t('oper.index.137217-6'),
      value: model.value?.methodParams,
    }, {
      label: t('oper.index.137217-7'),
      value: model.value?.api,
    }, {
      label: t('oper.index.137217-8'),
      value: model.value?.operationDesc,
    }, {
      label: t('oper.index.137217-9'),
      value: model.value?.startTime,
    }, {
      label: t('oper.index.137217-10'),
      value: model.value?.endTime,
    }, {
      label: t('oper.index.137217-11'),
      value: model.value?.runTime,
    }, {
      label: t('oper.index.137217-12'),
      value: model.value?.returnValue,
    }, {
      label: t('oper.index.137217-13'),
      value: model.value?.exceptionInfo,
    }]
  ))
  const searchOptions = ref<FormSpace.Options>({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('oper.index.137217-1'),
      field: 'operName'
    }, {
      type: 'input',
      label: t('oper.index.137217-8'),
      field: 'operationDesc'
    }, {
      type: 'input',
      label: t('oper.index.137217-4'),
      field: 'method'
    }, {
      type: 'input',
      label: t('oper.index.137217-7'),
      field: 'api'
    }, {
      type: 'customize',
      label: t('oper.index.137217-14'),
      field: '',
      render: (value: object) => {
        return <a-range-picker v-model={dateRange.value} style="width: 300px;" size={size.value} />
      }
    }]
  })
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('oper.index.137217-1'),
      dataIndex: 'operName',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('oper.index.137217-8'),
      dataIndex: 'operationDesc',
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
      title: t('oper.index.137217-2'),
      dataIndex: 'address',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('oper.index.137217-4'),
      dataIndex: 'method',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('oper.index.137217-7'),
      dataIndex: 'api',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('oper.index.137217-15'),
      align: 'center',
      render: (data: { record: TableData; column: TableColumnData; rowIndex: number; }) => (
        <a-button onClick={() => openDetailsModal(data.record)} type="outline" shape="circle" size={size.value}>
          <icon-eye />
        </a-button>
      )
    }
  }]))
  const openDetailsModal = async (record: TableData) => {
    const { data } = await logOne(record.id)
    model.value = data
    setVisible(true)
  }
  const copyJson = () => {
    if (!isSupported.value) {
      Message.error(t('oper.index.137217-16'))
      return
    }
    copy(JSON.stringify(details.value))
    Message.success(t('oper.index.137217-17'))
  }
  const clear = () => {
    Modal.warning({
      title: t('oper.index.137217-18'),
      content: t('oper.index.137217-19'),
      hideCancel: false,
      maskClosable: false,
      onBeforeOk: onClear
    })
  }
  const onClear = async () => {
    const { success } = await clean()
    if (success) {
      Message.success(t('oper.index.137217-20'))
      genericRef.value?.fetchData()
    } else {
      Message.error(t('oper.index.137217-21'))
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
        page={async (data: SysLogParams) => await logPage(data)}
        remove={async (id: number | string) => await logDelete(id)}
        display={useDisplay({ showAdd: false, showBatchEdit: false }).value}
        permission={{
          del: ['system:operlog:del'],
          query: ['system:operlog:query']
        }}
      >
        {{
          modal: () => (
            <>
              <a-drawer
                title={t('oper.index.137217-22')}
                unmountOnClose={true}
                v-model={[visible.value, 'visible']}
                width={width.value > 600 ? 600 : '100%'}
                okButtonProps={{ size: size.value }}
                cancelButtonProps={{ size: size.value }}
              >
                {{
                  default: () => (<a-descriptions data={details.value} bordered column={1} size={size.value} />),
                  footer: () => (<a-button onClick={() => copyJson()} type="primary" size={size.value}>{t('oper.index.137217-23')}</a-button>)
                }}
              </a-drawer>
            </>
          ),
          'operate-left': () => (
            <a-button onClick={clear} v-permission={permission} type="primary" status="danger" size={size.value}>
              {{ icon: () => <icon-delete />, default: () => t('oper.index.137217-24') }}
            </a-button>
          )
        }}
      </GenericComment>
    </>
  )
})