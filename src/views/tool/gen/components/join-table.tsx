import { useAppStore } from '@/store'
import { ref, computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { GenTableColumn, JoinTables } from '@/api/tool/gen/type'
import style from '../index.module.scss'
import { FieldRule, FormInstance } from '@arco-design/web-vue'

export interface JoinTableProps {
  modelValue: JoinTables
  sourceColumns?: GenTableColumn[] // 源表字段
  targetTables?: Record<string, GenTableColumn[]> // 所有可选的目标表及其字段
}

export default defineComponent((props: JoinTableProps, { emit, expose }) => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const formRef = ref<FormInstance>()
  
  // 添加验证规则
  const rules = computed<Record<string, FieldRule | FieldRule[]>>(() => ({
    targetTable: [{ required: true, message: '请选择目标表' }],
    relationType: [{ required: true, message: '请选择关联关系' }],
    selfField: [{ required: true, message: '请选择本表关联字段' }],
    targetField: [{ required: true, message: '请选择目标表关联字段' }],
    // 多对多关系时的额外验证
    joinTable: [{
      required: true,
      message: '请选择中间表',
      validator: (value: string | undefined, callback: (error?: string) => void): void => {
        callback(props.modelValue.relationType !== 'many-to-many' || !value ? '请选择中间表' : undefined)
      }
    }],
    joinSelfColumn: [{
      required: true,
      message: '请选择中间表关联本表字段',
      validator: (value: string | undefined, callback: (message?: string) => void): void => {
        callback(props.modelValue.relationType !== 'many-to-many' || !value ? '请选择中间表关联本表字段' : undefined)
      }
    }],
    joinTargetColumn: [{
      required: true,
      message: '请选择中间表关联目标表字段',
      validator: (value: string | undefined, callback: (error?: string) => void): void => {
        callback(props.modelValue.relationType !== 'many-to-many' || !value ? '请选择中间表关联目标表字段' : undefined)
      }
    }]
  }))

  const validate: () => Promise<boolean> = async () => {
    const errors = await formRef.value?.validate()
    return !errors
  }
  // 当前选中的目标表字段列表
  const targetColumns = computed(() => 
    props.modelValue.targetTable ? props.targetTables?.[props.modelValue.targetTable] || [] : []
  )

  const valueChange = (field: keyof JoinTables, value: any) => {
    const newValue = { ...props.modelValue, [field]: value }
    
    // 当目标表改变时，清空相关字段
    if (field === 'targetTable') {
      newValue.targetField = undefined
      newValue.joinTable = undefined
      newValue.joinSelfColumn = undefined
      newValue.joinTargetColumn = undefined
    }
    
    emit('update:modelValue', newValue)
  }
  
  expose({ validate })

  return () => (
    <div class={style.joinTableContent}>
      <a-form 
        ref={formRef}
        model={props.modelValue} 
        layout="vertical"
        rules={rules.value}
        size={size.value}
      >
        <a-row gutter={16}>
          <a-col span={24}>
            <div class={style.joinTableDivider}>表配置</div>
          </a-col>
          <a-col span={12}>
            <a-form-item field="targetTable" label="目标表">
              <a-select
                modelValue={props.modelValue.targetTable}
                onUpdate:modelValue={(value: string) => valueChange('targetTable', value)}
                placeholder="请选择目标表"
                allowClear={true}
                size={size.value}
              >
                {Object.keys(props.targetTables || {}).map(tableName => (
                  <a-option key={tableName} label={tableName} value={tableName} />
                ))}
              </a-select>
            </a-form-item>
          </a-col>
          <a-col span={12}>
            <a-form-item field="relationType" label="关联关系">
              <a-select
                modelValue={props.modelValue.relationType}
                onUpdate:modelValue={(value: string) => valueChange('relationType', value)}
                placeholder="请选择关联关系"
                allowClear={true}
                size={size.value}
              >
                <a-option label="一对一" value="one-to-one" />
                <a-option label="一对多" value="one-to-many" />
                <a-option label="多对一" value="many-to-one" />
                <a-option label="多对多" value="many-to-many" />
              </a-select>
            </a-form-item>
          </a-col>

          <a-col span={12}>
            <a-form-item field="selfField" label="本表关联字段">
              <a-select
                modelValue={props.modelValue.selfField}
                onUpdate:modelValue={(value: string) => valueChange('selfField', value)}
                placeholder="请选择本表字段"
                allowClear={true}
                size={size.value}
              >
                {props.sourceColumns?.map(column => (
                  <a-option 
                    key={column.columnName} 
                    label={`${column.columnName}(${column.columnDescribe || ''})`}
                    value={column.columnName} 
                  />
                ))}
              </a-select>
            </a-form-item>
          </a-col>

          {props.modelValue.targetTable && (
            <a-col span={12}>
              <a-form-item field="targetField" label="目标表关联字段">
                <a-select
                  modelValue={props.modelValue.targetField}
                  onUpdate:modelValue={(value: string) => valueChange('targetField', value)}
                  placeholder="请选择目标字段"
                  allowClear={true}
                  size={size.value}
                >
                  {targetColumns.value.map(column => (
                    <a-option 
                      key={column.columnName} 
                      label={`${column.columnName}(${column.columnDescribe || ''})`}
                      value={column.columnName}
                    />
                  ))}
                </a-select>
              </a-form-item>
            </a-col>
          )}

          {props.modelValue.relationType === 'many-to-many' && (
            <>
              <a-col span={24}>
                <div class={style.joinTableDivider}>中间表配置</div>
              </a-col>
              <a-col span={12}>
                <a-form-item field="joinTable" label="中间表">
                  <a-select
                    modelValue={props.modelValue.joinTable}
                    onUpdate:modelValue={(value: string) => valueChange('joinTable', value)}
                    placeholder="请选择中间表"
                    allowClear={true}
                    size={size.value}
                  >
                    {Object.keys(props.targetTables || {}).map(tableName => (
                      <a-option key={tableName} label={tableName} value={tableName} />
                    ))}
                  </a-select>
                </a-form-item>
              </a-col>
              {props.modelValue.joinTable && (
                <>
                  <a-col span={12}>
                    <a-form-item field="joinSelfColumn" label="中间表关联本表字段">
                      <a-select
                        modelValue={props.modelValue.joinSelfColumn}
                        onUpdate:modelValue={(value: string) => valueChange('joinSelfColumn', value)}
                        placeholder="请选择关联字段"
                        allowClear={true}
                        size={size.value}
                      >
                        {props.targetTables?.[props.modelValue.joinTable]?.map(column => (
                          <a-option 
                            key={column.columnName} 
                            label={`${column.columnName}(${column.columnDescribe || ''})`}
                            value={column.columnName}
                          />
                        ))}
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col span={12}>
                    <a-form-item field="joinTargetColumn" label="中间表关联目标表字段">
                      <a-select
                        modelValue={props.modelValue.joinTargetColumn}
                        onUpdate:modelValue={(value: string) => valueChange('joinTargetColumn', value)}
                        placeholder="请选择关联字段"
                        allowClear={true}
                        size={size.value}
                      >
                        {props.targetTables?.[props.modelValue.joinTable]?.map(column => (
                          <a-option 
                            key={column.columnName} 
                            label={`${column.columnName}(${column.columnDescribe || ''})`}
                            value={column.columnName}
                          />
                        ))}
                      </a-select>
                    </a-form-item>
                  </a-col>
                </>
              )}
            </>
          )}
        </a-row>
      </a-form>
    </div>
  )
}, {
  props: {
    modelValue: {
      type: Object as PropType<JoinTables>,
      required: true,
      default: () => ({})
    },
    sourceColumns: {
      type: Array as PropType<GenTableColumn[]>,
      default: () => []
    },
    targetTables: {
      type: Object as PropType<Record<string, GenTableColumn[]>>,
      default: () => ({})
    }
  },
  emits: ['update:modelValue']
})