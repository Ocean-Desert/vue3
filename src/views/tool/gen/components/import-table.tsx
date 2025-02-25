import SearchComponent from '@/components/search'
import { dbTablePage, importTable } from '@/api/tool/gen'
import type { GenTable, GenTableParams } from '@/api/tool/gen/type'
import { useForm, useTable } from '@/hooks/options'
import { useAppStore } from '@/store'
import { computed, defineComponent, onMounted, ref, toValue } from 'vue'
import { TableColumnData } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { to } from '@/utils'

export interface ImportTableExposed {
  showModal: () => void
}

export default defineComponent((_, { expose, emit }) => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const visible = ref(false)
  const searchModel = ref<GenTableParams>({})
  const { loading, tableData, fetchData, pagination, selectKeys, select, selectAll, handleDelete } =
    useTable(
      async (pagin: ApiSpace.PageParams) => await dbTablePage({ ...searchModel.value, page: pagin.page, size: pagin.size }),
      { isPagination: true, rowKey: 'tableName', immediate: false }
    )

  const columns: TableColumnData[] = [
    { title: '表名称', dataIndex: 'tableName' },
    { title: '表描述', dataIndex: 'tableDescribe' },
    { title: '创建时间', dataIndex: 'createTime' },
  ]
  const onSearch = () => {
    fetchData()
  }
  const onReset = () => { 
    searchModel.value = {}
    fetchData()
  }
  const onImportTable = async () => {
    if (selectKeys.value.length < 1) return
    const [err, response] = await to<ApiSpace.Result<boolean>>(importTable(selectKeys.value))
    if (!err) {
      fetchData()
      emit('success')
    }
  }
  const showModal = () => {
    visible.value = true
  }
  expose({ showModal })
  return () => (
    <>
      <a-modal v-model:visible={visible.value} title={'导入表'} width={768} onOk={onImportTable} onBeforeOpen={() => fetchData()}>
        <a-form autoLabelWidth={true} size={size.value} model={searchModel.value} layout={'horizontal'}>
          <a-row gutter={20}>
            <a-col span={8}>
              <a-form-item field={'tableName'} label={'表名称'}>
                <a-input allowClear={true} placeholder={'请输入表名称'} v-model={searchModel.value.tableName} size={size.value}></a-input>
              </a-form-item>
            </a-col>
            <a-col span={8}>
              <a-form-item field={'tableDescribe'} label={'表描述'}>
                <a-input allowClear={true} placeholder={'请输入表描述'} v-model={searchModel.value.tableDescribe} size={size.value}></a-input>
              </a-form-item>
            </a-col>
            <a-col span={8}>
              <a-space size={size.value}>
                <a-button type="primary" onClick={onSearch} size={size.value}>
                  {{ icon: () => <icon-search />, default: () => t('global.search.submit') }}
                </a-button>
                <a-button onClick={onReset} size={size.value}>
                  {{ icon: () => <icon-refresh />, default: () => t('global.search.reset') }}
                </a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-form>
        <a-table
          rowKey={'tableName'}
          rowSelection={{ type: 'checkbox', showCheckedAll: true, onlyCurrent: false }}
          loading={loading.value}
          data={tableData.value}
          columns={columns}
          pagination={pagination}
          onSelect={select}
          onSelectAll={selectAll}
          size={size.value}
          scroll={{ maxHeight: '300px' }}
        />
      </a-modal>
    </>
  )
}, {
  emits: ['success']
})