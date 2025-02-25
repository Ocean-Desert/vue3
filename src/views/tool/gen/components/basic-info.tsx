import { computed, defineComponent, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { GenTable } from '@/api/tool/gen/type'
import { useAppStore } from '@/store'
import { FormInstance } from '@arco-design/web-vue'

export interface BasicInfoProps {
  modelValue: GenTable
}

export default defineComponent((props: BasicInfoProps, { emit, expose }) => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const formRef = ref<FormInstance>()
  const rules = {
    tableName: [{ required: true, message: '请输入表名' }],
    tableDescribe: [{ required: true, message: '请输入表描述' }],
    className: [{ required: true, message: '请输入类名' }, { match: /^[A-Z][A-Za-z0-9_]*$/, message: '类名格式不正确' }],
    authorName: [{ required: true, message: '请输入作者' }]
  }
  const valueChange = (field: keyof GenTable, value: string) => {
    emit('update:modelValue', {...props.modelValue, [field]: value })
  }
  watch(() => props.modelValue?.tableName, (newVal) => {
    if (newVal && !props.modelValue?.className) {
      const className = newVal.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      emit('update:modelValue', { ...props.modelValue, className })
    }
  })
  const validate = async () => {
    const errors = await formRef.value?.validate()
    return !errors
  }
  expose({ validate })
  return () => (
    <>
      <a-form ref={formRef} rules={rules} model={props.modelValue}>
        <a-row gutter={20}>
          <a-col span={8}>
            <a-form-item field="tableName" label="表名">
              <a-input modelValue={props.modelValue?.tableName} onUpdate:modelValue={(value: string) => valueChange('tableName', value)} size={size.value} readonly={true} />
            </a-form-item>
          </a-col>
          <a-col span={8}>
            <a-form-item field="tableDescribe" label="描述">
              <a-input
                modelValue={props.modelValue?.tableDescribe}
                onUpdate:modelValue={(value: string) => valueChange('tableDescribe', value)}
                placeholder="请输入描述"
                size={size.value}
                allowClear={true}
              />
            </a-form-item>
          </a-col>
          <a-col span={8}>
            <a-form-item field="className" label="类名">
              <a-input
                modelValue={props.modelValue?.className}
                onUpdate:modelValue={(value: string) => valueChange('className', value)}
                placeholder="请输入类名"
                size={size.value}
                allowClear={true}
              />
            </a-form-item>
          </a-col>
          <a-col span={8}>
            <a-form-item field="authorName" label="作者">
              <a-input
                modelValue={props.modelValue?.authorName}
                onUpdate:modelValue={(value: string) => valueChange('authorName', value)}
                placeholder="请输入作者"
                size={size.value}
                allowClear={true}
              />
            </a-form-item>
          </a-col>
          <a-col span={8}>
            <a-form-item field="sort" label="排序">
              <a-input-number
                modelValue={props.modelValue?.sort}
                onUpdate:modelValue={(value: string) => valueChange('sort', value)}
                placeholder="请输入排序"
                size={size.value}
                allowClear={true}
                mode={'button'}
                min={1}
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </>
  )
}, {
  props: {
    modelValue: {
      type: Object as PropType<GenTable>,
      required: true,
      default: () => ({})
    }
  },
  emits: ['update:modelValue']
})