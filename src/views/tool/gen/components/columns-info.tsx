import type { GenTableColumn, GenTableInfo, SelectOptions } from '@/api/tool/gen/type'
import { useAppStore } from '@/store'
import { computed, defineComponent, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import style from '../index.module.scss'
import { dictTypeOptionselect } from '@/api/system/dict'
import { to } from '@/utils'
import type { SysDictType } from '@/api/system/dict/type'
import JsonEditor from '@/components/jsonEditor'
import SelectOptionsComment from './select-options'
import { SelectOptionData } from '@arco-design/web-vue'
import { parse, ParseError } from 'jsonc-parser'
import { Message } from '@arco-design/web-vue'

export type ColumnsInfoProps = {
  modelValue?: GenTableInfo
}

// 将常量提取出来
const QUERY_TYPE = [
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'not_equals' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'ge' },
  { label: '小于等于', value: 'le' },
  { label: '匹配', value: 'like' },
  { label: '不匹配', value: 'not_like' },
  { label: '左匹配', value: 'like_left' },
  { label: '右匹配', value: 'like_right' },
  { label: '非左匹配', value: 'not_like_left' },
  { label: '非右匹配', value: 'not_like_right' },
  { label: '非空', value: 'is_not_null' },
  { label: '为空', value: 'is_null' },
  { label: '集合', value: 'in' },
  { label: '非集合', value: 'not_in' },
  { label: '区间', value: 'between' },
  { label: '非区间', value: 'not_between' },
]

const HTML_TYPE = [
  { label: '输入框', value: 'input' },
  { label: '选择器', value: 'select' },
  { label: '单选框', value: 'radio-group' },
  { label: '复选框', value: 'checkbox-group' },
  { label: '文本域', value: 'textarea' },
  { label: '日期选择器', value: 'date-picker' },
  { label: '时间选择器', value: 'time-picker' },
  { label: '数字输入框', value: 'input-number' },
  { label: '密码输入框', value: 'input-password' },
  { label: '上传', value: 'upload' },
  { label: '评分', value: 'rate' },
  { label: '开关', value: 'switch' },
  { label: '滑动输入条', value: 'slider' },
  { label: '级联选择', value: 'cascader' },
  { label: '树选择', value: 'tree-select' },
]

export default defineComponent((props: ColumnsInfoProps, { emit, expose }) => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const dictTypeOptions = ref<SelectOptionData[]>([])

  // 表格数据的计算属性
  const genTableColumn = computed<GenTableColumn[]>({
    get: () => props.modelValue?.columns as GenTableColumn[],
    set: (data: GenTableColumn[]) => {
      emit('update:modelValue', { ...props.modelValue, columns: data })
    }
  })

  // 关联表数据
  const selectOptionData = computed<Record<string, string[]> | undefined>(() => (
    props.modelValue?.tables?.reduce((acc, item) => {
      acc[item.tableName as string] = item.columns?.map(column => column.columnName) || []
      return acc
    }, {})
  ))

  // 获取字典类型数据
  const fetchDictTypeData = async () => {
    const [err, response] = await to<ApiSpace.Result<SysDictType[]>>(dictTypeOptionselect())
    if (!err && response.data) {
      dictTypeOptions.value = response.data.map(item => ({ 
        label: `${item.dictName}(${item.dictType})`, 
        value: item.dictType 
      }))
    }
  }

  // 表格列配置
  const columns = computed(() => [
    {
      title: '序号',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '表字段',
      dataIndex: 'columnName',
      width: 125,
      fixed: 'left',
    },
    {
      title: '字段注释',
      dataIndex: 'columnDescribe',
      width: 150,
      render: ({ record }) => (
        <a-input 
          v-model={record.columnDescribe} 
          allow-clear 
          size={size.value} 
        />
      )
    },
    {
      title: '表类型',
      dataIndex: 'columnType',
      width: 150,
    },
    {
      title: 'Java类型',
      dataIndex: 'javaType',
      width: 150,
      render: ({ record }) => (
        <a-select 
          v-model={record.javaType} 
          options={[
            'String', 'Short', 'Integer', 'Long', 'Double', 
            'Float', 'Boolean', 'BigDecimal', 'Date', 
            'LocalDateTime', 'LocalDate', 'LocalTime', 'Timestamp'
          ]} 
          placeholder="请选择" 
        />
      )
    },
    {
      title: 'TypeScript类型',
      dataIndex: 'tsType',
      width: 150,
      render: ({ record }) => (
        <a-select 
          v-model={record.tsType} 
          options={['string', 'boolean', 'number']} 
          placeholder="请选择" 
        />
      )
    },
    {
      title: '字段名',
      dataIndex: 'fieldName',
      width: 150,
      render: ({ record }) => (
        <a-input 
          v-model={record.fieldName} 
          allow-clear 
          size={size.value} 
        />
      )
    },
    {
      title: '必选',
      dataIndex: 'isRequired',
      width: 80,
      align: 'center',
      render: ({ record }) => (
        <a-switch 
          v-model={record.isRequired} 
          size={size.value} 
        />
      )
    },
    {
      title: '插入',
      dataIndex: 'isInsert',
      width: 80,
      align: 'center',
      render: ({ record }) => (
        <a-switch 
          v-model={record.isInsert} 
          size={size.value} 
        />
      )
    },
    {
      title: '编辑',
      dataIndex: 'isEdit',
      width: 80,
      align: 'center',
      render: ({ record }) => (
        <a-switch 
          v-model={record.isEdit} 
          size={size.value} 
        />
      )
    },
    {
      title: '列表',
      dataIndex: 'isList',
      width: 80,
      align: 'center',
      render: ({ record }) => (
        <a-switch 
          v-model={record.isList} 
          size={size.value} 
        />
      )
    },
    {
      title: '多选',
      dataIndex: 'isMultiple',
      width: 80,
      align: 'center',
      render: ({ record }) => (
        <a-switch 
          v-model={record.isMultiple} 
          size={size.value} 
        />
      )
    },
    {
      title: '查询',
      dataIndex: 'isQuery',
      width: 80,
      align: 'center',
      render: ({ record }) => (
        <a-switch 
          v-model={record.isQuery} 
          size={size.value} 
        />
      )
    },
    {
      title: '查询方式',
      dataIndex: 'queryType',
      width: 150,
      render: ({ record }) => (
        <a-select 
          v-model={record.queryType} 
          options={QUERY_TYPE} 
          placeholder="请选择" 
        />
      )
    },
    {
      title: '显示类型',
      dataIndex: 'htmlType',
      width: 150,
      render: ({ record }) => (
        <a-select 
          v-model={record.htmlType} 
          options={HTML_TYPE} 
          placeholder="请选择" 
        />
      )
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      width: 220,
      render: ({ record }) => (
        <a-select 
          v-model={record.dictType} 
          options={dictTypeOptions.value} 
          placeholder="请选择" 
          allowClear 
        />
      )
    },
    {
      title: '自定义字典',
      dataIndex: 'dictCustom',
      width: 200,
      render: ({ record }) => renderDictCustomEditor(record)
    },
    {
      title: '关联选项',
      dataIndex: 'selectOptions',
      width: 200,
      render: ({ record }) => renderSelectOptions(record)
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 150,
      render: ({ record }) => (
        <a-input-number
          v-model={record.sort}
          mode="button"
          min={0}
          size={size.value}
        />
      )
    }
  ])

  const renderDictCustomEditor = (record: GenTableColumn) => 
    <a-trigger trigger="click" showArrow={true}>
      {{
        default: () => (
          <a-input
            v-model={record.dictCustom}
            readonly={true}
            size={size.value}
            allowClear={true}
            placeholder="仅支持JSON格式"
          />
        ),
        content: () => (
          <JsonEditor
            modelValue={record.dictCustom as string}
            onUpdate:modelValue={(value: string) => record.dictCustom = value}
            validateOnChange={true}
            showFullScreen={false}
            width={400}
          />
        )
      }}
    </a-trigger>
  

  const renderSelectOptions = (record: GenTableColumn) => 
    <a-trigger trigger="click" showArrow={true}>
      {{
        default: () => <a-button type="text" size={size.value} status={record.selectOptions ? 'success' : 'normal'}>{record.selectOptions ? '已配置' : '配置关联选项'}</a-button>,
        content: () => (
          <SelectOptionsComment
            modelValue={record.selectOptions as SelectOptions}
            options={selectOptionData.value}
            width="400px"
            onSubmit={(value: SelectOptions) => {record.selectOptions = value}}
            onClear={() => {record.selectOptions = undefined}}
          />
        )
      }}
    </a-trigger>

  onMounted(() => {
    fetchDictTypeData()
  })

  return () => (
    <div class={style.columnsInfoWrapper}>
      <a-table
        class={style.columnInfo}
        columns={columns.value}
        data={genTableColumn.value}
        scroll={{ x: '100%', maxHeight: '500px' }}
        scrollbar={true}
        pagination={false}
      />
    </div>
  )
}, {
  props: {
    modelValue: {
      type: Object as PropType<GenTableInfo>,
      default: () => ({
        tableInfo: {},
        columns: [],
        tables: [],
      })
    }
  },
  emits: ['update:modelValue']
})
