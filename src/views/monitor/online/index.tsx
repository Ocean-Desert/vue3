import { computed, defineComponent, onBeforeMount, onMounted, ref, watchEffect } from 'vue'
import GenericComment from '@/components/generic/index'
import type { SysUserOnline, SysUserOnlineParams } from '@/api/monitor/online/type'
import { onlinePage, forceLogout } from '@/api/monitor/online'
import { useDateRange, useDisplay } from '@/hooks/options'
import type { TableColumnData, TableData } from '@arco-design/web-vue'
import { Modal } from '@arco-design/web-vue'
import { GenericInstance } from '@/types/generic'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const genericRef = ref<GenericInstance>()
  const searchModel = ref<SysUserOnlineParams>({})
  const { dateRange } = useDateRange(searchModel)
  const { t } = useI18n()
  const appSotre = useAppStore()
  const size = computed(() => appSotre.size)
  const permission = ['monitor:online:forceLogout']
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('online.index.431513-0'),
      field: 'username'
    }, {
      type: 'customize',
      label: t('online.index.431513-1'),
      field: '',
      render: (value: object) => {
        return <a-range-picker v-model={dateRange.value} style="width: 300px;" size={size.value} />
      }
    }]
  }))
  const columns = computed<TableSpace.Columns[]>(() => ([
    {
      type: 'default',
      props: {
        title: t('online.index.431513-2'),
        dataIndex: 'token',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('online.index.431513-0'),
        dataIndex: 'username',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: 'IP',
        dataIndex: 'ip',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('online.index.431513-3'),
        dataIndex: 'loginLocation',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('online.index.431513-4'),
        dataIndex: 'browser',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('online.index.431513-5'),
        dataIndex: 'system',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('online.index.431513-6'),
        dataIndex: 'loginTime',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('online.index.431513-7'),
        align: 'center',
        render: (data: { record: TableData; column: TableColumnData; rowIndex: number; }) => (
          <a-button onClick={() => onLogout(data.record)} type="primary" status="danger" v-permission={permission} size={size.value}>{t('online.index.431513-8')}</a-button>
        )
      }
    }
  ]))
  const onLogout = (record: SysUserOnline) => {
    Modal.warning({
      title: t('online.index.431513-9'),
      content: t('online.index.431513-10', { label: record.username }),
      hideCancel: false,
      maskClosable: false,
      onBeforeOk: () => logout(record.token as string)
    })
  }
  const logout = async (token: string) => {
    await forceLogout(token)
    genericRef.value?.fetchData()
  }
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        immediate={true}
        isSelection={false}
        v-model={[searchModel.value, 'searchModel']}
        page={async (data: SysUserOnlineParams) => await onlinePage(data)}
        rowKey={'id'}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={{ form: {}, columns: [] }}
        display={useDisplay({
          showAdd: false,
          showBatchDel: false,
          showBatchEdit: false,
          showEdit: false,
          showDel: false
        }).value}
      ></GenericComment>
    </>
  )
})