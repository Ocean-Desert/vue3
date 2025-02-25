import { useAppStore } from '@/store'
import { GenericInstance } from '@/types/generic'
import { computed, defineComponent, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import GenericComment from '@/components/generic/index'
import ImportTable, { ImportTableExposed } from './components/import-table'
import PreviewCode, { PreviewCodeExposed } from './components/preview-code'
import type { GenTable, GenTableParams } from '@/api/tool/gen/type'
import { useDateRange, useDisplay } from '@/hooks/options'
import { genTableDelete, genTablePage, generateCode, batchGenerateCode } from '@/api/tool/gen'
import { Message, TableColumnData, TableData } from '@arco-design/web-vue'
import { downloadFile } from '@/utils'
import { useRouter } from 'vue-router'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const router = useRouter()
  const size = computed(() => appStore.size)
  const genericRef = ref<GenericInstance>()
  const importTableRef = ref<ImportTableExposed>()
  const previewCodeRef = ref<PreviewCodeExposed>()
  const searchModel = ref<GenTableParams>({})
  const selectedRowKeys = ref<number[]>([])
  const previewTableId = ref<number>()
  const { dateRange } = useDateRange(searchModel)
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: '表名称',
      field: 'tableName'
    }, {
      type: 'input',
      label: '表描述',
      field: 'tableDescribe'
    }, {
      type: 'range-picker',
      label: '创建时间',
      field: 'createTime',
      props: {
        showTime: true,
        format: 'YYYY-MM-DD',
        modelValue: dateRange.value,
        'onUpdate:modelValue': (value: any) => dateRange.value = value,
        placeholder: ['开始时间', '结束时间'],
        allowClear: true,
      }
    }]
  }))
  const columns = computed<TableSpace.Columns[]>(() => ([
    {
      type: 'default',
      props: {
        title: '主键',
        dataIndex: 'id',
        align: 'center',
      },
    }, {
      type: 'default',
      props: {
        title: '表名',
        dataIndex: 'tableName',
        align: 'center',
      },
    }, {
      type: 'default',
      props: {
        title: '表描述',
        dataIndex: 'tableDescribe',
        align: 'center',
      },
    }, {
      type: 'default',
      props: {
        title: '实体类名',
        dataIndex: 'className',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: '创建时间',
        dataIndex: 'createTime',
        align: 'center',
      }
    }, {
    type: 'default',
    props: {
      title: '操作',
      align: 'center',
      render: (data: { record: GenTable; column: TableColumnData; rowIndex: number; }) => (
        <a-space size={size.value}>
          <a-tooltip content="预览">
            <a-button onClick={() => onPreviewCode(data.record)} type="text" size={size.value}>{'预览'}</a-button>
          </a-tooltip>
          <a-tooltip content="修改">
            <a-button onClick={() => onEdit(data.record)} type="text" size={size.value}>{'修改'}</a-button>
          </a-tooltip>
          <a-tooltip content="删除">
            <a-button onClick={() => onDelete(data.record)} type="text" size={size.value}>{'删除'}</a-button>
          </a-tooltip>
          <a-tooltip content="生成代码">
            <a-button onClick={() => onGenerateCode(data.record)} type="text" size={size.value}>{'生成代码'}</a-button>
          </a-tooltip>
        </a-space>
      )
    },
  }
  ]))
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { hide: true },
    columns: []
  }))
  const onDelete = (value: GenTable) => {
    genericRef.value?.handleDelete(async () => await genTableDelete(value.id as number))
  }
  const onEditByKey = () => { 
    const key = selectedRowKeys.value[selectedRowKeys.value.length - 1]
    router.push({
      name: 'genEditIndex',
      params: { tableId: key }
    })
  }
  const onEdit = (genTable: GenTable) => { 
    router.push({
      name: 'genEditIndex',
      params: { tableId: genTable.id }
    })
  }

  const onBatchGenerateCode = async () => { 
    const data: Blob = await batchGenerateCode(selectedRowKeys.value)
    downloadFile(data, 'code.zip')
  }
  const onGenerateCode = async (genTable: GenTable) => {
    const data: Blob = await generateCode(genTable.id as number)
    downloadFile(data, genTable.businessName + '.zip')
  }
  const onPreviewCode = (genTable: GenTable) => {
    previewTableId.value = undefined
    nextTick(() => {
      previewTableId.value = genTable.id as number
      previewCodeRef.value?.showModal()
    })
  }
  const onSuccess = () => {
    Message.success('导入成功')
    genericRef.value?.fetchData()
  }
 
  return () => ( 
    <>
      <GenericComment
        ref={genericRef}
        immediate={true}
        isSelection={true}
        v-model:searchModel={searchModel.value}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        onSelect={(rowKeys: (string | number)[], rowKey: string | number, record: GenTable) => selectedRowKeys.value = rowKeys as number[]}
        onSelectAll={(checked: boolean) => selectedRowKeys.value = checked ? (genericRef.value?.getTableData() as GenTable[]).map((item) => item['id'] as number) : []}
        page={async (data: GenTableParams) => await genTablePage(data)}
        display={useDisplay({ showAdd: false, showBatchEdit: false, showEdit: false }).value}
        remove={async (classId: number | string) => await genTableDelete(classId)}
      >
        {{
          'operate-left': () => (<>
            <a-button onClick={onEditByKey} size={size.value} type="primary" status="success" disabled={selectedRowKeys.value.length !== 1}>
              {{ icon: () => <icon-edit />, default: () => t('global.generic.edit') }}
            </a-button>
            <a-button onClick={() => importTableRef.value?.showModal()} size={size.value}>
              {{ icon: () => <icon-upload />, default: () => '导入' }}
            </a-button>
            <a-button onClick={() => onBatchGenerateCode()} size={size.value} type="primary" disabled={selectedRowKeys.value.length === 0}>
              {{ icon: () => <icon-download />, default: () => '生成' }}
            </a-button>
          </>)
        }}
      </GenericComment>
      <ImportTable ref={importTableRef} onSuccess={onSuccess}></ImportTable>
      <PreviewCode ref={previewCodeRef} tableId={previewTableId.value}></PreviewCode>
    </>
  )
})