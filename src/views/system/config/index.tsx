import { computed, defineComponent, ref } from 'vue'
import { configOne, configPage, configUpdate, configAdd, configDelete } from '@/api/system/config'
import GenericComment from '@/components/generic/index'
import type { SysConfig, SysConfigParams } from '@/api/system/config/type'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const searchOptions = ref<FormSpace.Options>({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('config.index.053560-0'),
      field: 'name'
    }, {
      type: 'input',
      label: t('config.index.053560-1'),
      field: 'key'
    }, {
      type: 'select',
      label: t('config.index.053560-2'),
      field: 'type',
      options: [{ label: t('config.index.053560-3'), value: false }, { label: t('config.index.053560-4'), value: true }]
    }]
  })
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('config.index.053560-0'),
      dataIndex: 'name',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('config.index.053560-1'),
      dataIndex: 'key',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('config.index.053560-5'),
      dataIndex: 'value',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('config.index.053560-2'),
      dataIndex: 'type',
      align: 'center',
    },
    options: [{ label: t('config.index.053560-3'), value: false }, { label: t('config.index.053560-4'), value: true }]
  }, {
    type: 'default',
    props: {
      title: t('config.index.053560-6'),
      dataIndex: 'remark',
      align: 'center',
    }
  }, {
    type: 'operate',
    props: {
      title: t('config.index.053560-7'),
      align: 'center',
    }
  }]))
  const formOptions = ref<FormSpace.Options>({
    form: { size: size.value },
    btns: { hide: true },
    columns: [{
      type: 'input',
      label: t('config.index.053560-8'),
      field: 'id',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('config.index.053560-0'),
      field: 'name',
      rules: [{ required: true, message: t('config.index.053560-9') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('config.index.053560-1'),
      field: 'key',
      rules: [{ required: true, message: t('config.index.053560-10') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('config.index.053560-5'),
      field: 'value',
      rules: [{ required: true, message: t('config.index.053560-10') }],
      props: { allowClear: true }
    }, {
      type: 'select',
      label: t('config.index.053560-2'),
      field: 'type',
      options: [{ label: t('config.index.053560-3'), value: false }, { label: t('config.index.053560-4'), value: true }],
      rules: [{ required: true, message: t('config.index.053560-11') }],
      props: { allowClear: true }
    }, {
      type: 'textarea',
      label: t('config.index.053560-6'),
      field: 'remark',
      props: { allowClear: true }
    }]
  })
  return () => (
    <>
      <GenericComment
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        page={async (data: SysConfigParams) => await configPage(data)}
        get={async (id: number | string) => await configOne(id)}
        save={async (data: SysConfig) => await configAdd(data)}
        update={async (data: SysConfig) => configUpdate(data)}
        remove={async (id: number | string) => await configDelete(id)}
        permission={{
          add: ['system:config:add'],
          del: ['system:config:del'],
          edit: ['system:config:edit'],
          query: ['system:config:query']
        }}
      />
    </>
  )
})