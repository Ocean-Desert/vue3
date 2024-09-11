import { defineComponent, toRef, ref, reactive, computed, onMounted, isProxy } from 'vue'
import GenericComment from '@/components/generic/index'
import { deptOne, deptList, deptUpdate, deptAdd, deptDelete, treeselect } from '@/api/system/dept'
import { SysDept, SysDeptParam } from '@/api/system/dept/type'
import { dict } from '@/api/system/dict'
import { useDictSelect, useDisplay, useTreeSelect } from '@/hooks/options'
import { TableData } from '@arco-design/web-vue'
import { GenericInstance } from '@/types/generic'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const genericRef = ref<GenericInstance>()
  const enabledDict = useDictSelect(async () => await dict('sys_enabled'))
  const treeSelect = useTreeSelect(async () => await treeselect({}), { immediate: false })
  const model = ref<SysDept>({})
  const hideTree = ref(false)
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('dept.index.069779-0'),
      field: 'deptName'
    }, {
      type: 'select',
      label: t('dept.index.069779-1'),
      field: 'enabled',
      options: enabledDict.options.value,
      props: { loading: enabledDict.loading.value },
    }]
  }))
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('dept.index.069779-0'),
      dataIndex: 'deptName',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('dept.index.069779-2'),
      dataIndex: 'sort',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('dept.index.069779-1'),
      dataIndex: 'enabled',
      align: 'center',
    },
    options: enabledDict.options.value
  }, {
    type: 'operate',
    props: {
      title: t('dept.index.069779-3'),
      align: 'center',
    },
    onUpdate: async (data: TableData) => {
      await treeSelect.fetchData()
      hideTree.value = data.parentId === 0
    },
  }]))
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { hide: true },
    columns: [{
      type: 'tree-select',
      label: t('dept.index.069779-4'),
      field: 'parentId',
      span: 12,
      data: treeSelect.data.value,
      hide: hideTree.value,
      rules: [{ required: true, message: t('dept.index.069779-5') }],
      props: { loading: treeSelect.loading.value }
    }, {
      type: 'input',
      label: t('dept.index.069779-6'),
      field: 'deptName',
      span: 12,
      props: { allowClear: true }
    }, {
      type: 'input-number',
      label: t('dept.index.069779-7'),
      field: 'sort',
      span: 12,
      rules: [{ required: true, message: t('dept.index.069779-8') }],
      props: { allowClear: true }
    }, {
      type: 'switch',
      label: t('dept.index.069779-1'),
      field: 'enabled',
      span: 12
    }]
  }))
  const onAppendChild = async (record: SysDept) => {
    const { data } = await deptOne(record.deptId as number)
    hideTree.value = record.parentId === 0
    await treeSelect.fetchData()
    if (data) model.value = data
    genericRef.value?.setFormTick('edit')
    genericRef.value?.setVisible(true)
  }
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        isPagination={false}
        isSelection={false}
        rowKey={'deptId'}
        v-model={[model.value, 'formModel']}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        list={async (data: SysDeptParam) => await deptList(data)}
        get={async (id: number | string) => await deptOne(id)}
        save={async (data: SysDept) => await deptAdd(data)}
        update={async (data: SysDept) => deptUpdate(data)}
        remove={async (id: number | string) => await deptDelete(id)}
        permission={{
          add: ['system:dept:add'],
          del: ['system:dept:del'],
          edit: ['system:dept:edit'],
          query: ['system:dept:query']
        }}
        display={useDisplay({ showBatchDel: false, showBatchEdit: false }).value}
        onAdd={() => treeSelect.fetchData()}
      >
        {{
          operate: (record: TableData) => {
            if (record.parentId === 0) return
            return <a-tooltip content={t('dept.index.069779-9')} >
              <a-button onClick={() => onAppendChild(record)} type="primary" size={size.value}>
                {{ icon: () => <icon-folder-add /> }}
              </a-button>
            </a-tooltip>
          }
        }}
      </GenericComment>
    </>
  )
})