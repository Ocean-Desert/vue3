import { SelectOptions } from '@/api/tool/gen/type'
import { useAppStore } from '@/store'
import { computed, defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
import { isNumber } from '@/utils/is'
import style from '../index.module.scss'
import { FormInstance, FieldRule } from '@arco-design/web-vue'
import { cloneDeep } from 'lodash-es'

export interface SelectOptionsProps {
  modelValue?: SelectOptions
  options?: Record<string, string[]>
  width?: string | number
  onSubmit?: (value: SelectOptions) => void
  onClear?: () => void
}

export default defineComponent((props: SelectOptionsProps, { emit }) => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = ref<SelectOptions>(cloneDeep(props.modelValue || {
    targetTable: '',
    labelColumn: '',
    valueColumn: ''
  }))

  // 验证规则
  const rules = computed<Record<string, FieldRule | FieldRule[]>>(() => ({
    targetTable: [{ required: true, message: '请选择目标表' }],
    labelColumn: [{
      required: true,
      message: '请选择标签字段',
      validator: (value: string | undefined, callback: (error?: string) => void): void => {
        callback(formData.value?.targetTable && !value ? '请选择标签字段' : undefined)
      }
    }],
    valueColumn: [{
      required: true,
      message: '请选择值字段',
      validator: (value: string | undefined, callback: (error?: string) => void): void => {
        callback(formData.value?.targetTable && !value ? '请选择值字段' : undefined)
      }
    }]
  }))

  // 目标表选项
  const selectOptionData = computed(() => props.options || {})
  
  // 当前选中表的列选项
  const columnOptions = computed(() => {
    if (!formData.value?.targetTable) return []
    return (selectOptionData.value[formData.value.targetTable] || [])
      .map((item: string) => ({ label: item, value: item }))
  })

  // 目标表变更处理
  const handleTargetTableChange = (value: string) => {
    formData.value = {
      targetTable: value,
      labelColumn: '',
      valueColumn: ''
    }
  }

  // 字段变更处理
  const handleFieldChange = (field: 'labelColumn' | 'valueColumn', value: string) => {
    formData.value[field] = value
  }

  // 确定按钮处理
  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      emit('submit', formData.value)
    } catch (errors) {
      console.log('表单验证失败:', errors)
    }
  }

  // 清除按钮处理
  const handleClear = () => {
    formData.value = {
      targetTable: '',
      labelColumn: '',
      valueColumn: ''
    }
    emit('clear')
  }

  return () => (
    <div class={style.selectOptionsWrapper}>
      <a-card 
        class={style.selectOptionsCard}
        style={{ width: isNumber(props.width) ? `${props.width}px` : props.width }} 
        size={size.value}
      >
        <a-form 
          ref={formRef}
          model={formData.value} 
          layout="vertical"
          rules={rules.value}
          size={size.value}
        >
          <a-form-item field="targetTable" label="目标表">
            <a-select
              modelValue={formData.value.targetTable}
              onUpdate:modelValue={handleTargetTableChange}
              placeholder="请选择目标表"
              allowClear
            >
              {Object.keys(selectOptionData.value).map(key => (
                <a-option key={key} label={key} value={key} />
              ))}
            </a-select>
          </a-form-item>

          {formData.value.targetTable && (
            <>
              <a-form-item field="labelColumn" label="标签字段">
                <a-select
                  modelValue={formData.value.labelColumn}
                  onUpdate:modelValue={(value: string) => handleFieldChange('labelColumn', value)}
                  options={columnOptions.value}
                  placeholder="请选择标签字段"
                  allowClear
                />
              </a-form-item>

              <a-form-item field="valueColumn" label="值字段">
                <a-select
                  modelValue={formData.value.valueColumn}
                  onUpdate:modelValue={(value: string) => handleFieldChange('valueColumn', value)}
                  options={columnOptions.value}
                  placeholder="请选择值字段"
                  allowClear
                />
              </a-form-item>
            </>
          )}
          <a-form-item>
            <a-space size={size.value}>
              <a-button size={size.value} type="primary" onClick={handleSubmit}>
                确定
              </a-button>
              <a-button size={size.value} onClick={handleClear}>
                清除
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  )
}, {
  props: {
    modelValue: Object as PropType<SelectOptions>,
    options: {
      type: Object as PropType<Record<string, string[]>>,
      required: false,
      default: () => ({})
    },
    width: {
      type: [String, Number] as PropType<string | number>,
      default: '400px'
    }
  },
  emits: ['submit', 'clear'],
})