import { SetupContext, defineComponent, ref, PropType, computed } from 'vue'
import type * as Arco from '@arco-design/web-vue'
import { hasProperty } from '@/utils'
import { ValidatedError } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

interface Props {
  modelValue: object
  options: FormSpace.Options
}

export default defineComponent((props: Props, context: SetupContext) => {
  const { slots, attrs, emit, expose } = context
  const { t } = useI18n()
  const formRef = ref<Arco.FormInstance>()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const checkOptions = (column: FormSpace.CoulmnsItem) => {
    if (!hasProperty(column, 'options')) {
      throw new Error(column.field + ' must have options')
    }
  }
  const renderInput = (column: FormSpace.CoulmnsItem) => {
    switch (column.type) {
      case 'input':
        return (
          <a-input
            placeholder={t('global.form.tip.input') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            size={size.value}
            {...column.props as Arco.InputInstance['$props']}
          >
            {{ ...column.slots }}
          </a-input>
        )
      case 'input-password':
        return (
          <a-input-password
            placeholder={t('global.form.tip.input') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            size={size.value}
            {...column.props as Arco.InputPasswordInstance['$props']}
          >
            {{ ...column.slots }}
          </a-input-password>
        )
      case 'input-number':
        return (
          <a-input-number
            placeholder={t('global.form.tip.input') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            size={size.value}
            {...column.props as Arco.InputNumberInstance['$props']}
          >
            {{ ...column.slots }}
          </a-input-number>
        )
      case 'textarea':
        return (
          <a-textarea
            placeholder={t('global.form.tip.input') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            {...column.props as Arco.TextareaInstance['$props']}
          >
            {{ ...column.slots }}
          </a-textarea>
        )
      case 'select':
        checkOptions(column)
        return (
          <a-select
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            options={column.options as Arco.SelectInstance['$props']['options']}
            size={size.value}
            {...column.props as Arco.SelectInstance['$props']}
          >
            {{ ...column.slots }}
          </a-select>
        )
      case 'upload':
        return (
          <a-upload {...column.props as Arco.UploadInstance['$props']}>
            {{ ...column.slots }}
          </a-upload>
        )
      case 'cascader':
        checkOptions(column)
        return (
          <a-cascader
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            options={column.options as Arco.CascaderInstance['$props']['options']}
            size={size.value}
            {...column.props as Arco.CascaderInstance['$props']}
          >
            {{ ...column.slots }}
          </a-cascader>
        )
      case 'tree-select':
        return (
          <a-tree-select
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            data={column.data as Arco.TreeSelectInstance['$props']['data']}
            size={size.value}
            {...column.props as Arco.TreeSelectInstance['$props']}
          >
            {{ ...column.slots }}
          </a-tree-select>
        )
      case 'radio-group':
        checkOptions(column)
        return (
          <a-radio-group
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            options={column.options as Arco.RadioGroupInstance['$props']['options']}
            size={size.value}
            {...column.props as Arco.RadioGroupInstance['$props']}
          >
            {{ ...column.slots }}
          </a-radio-group>
        )
      case 'checkbox-group':
        checkOptions(column)
        return (
          <a-checkbox-group
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            options={column.options as Arco.CheckboxGroupInstance['$props']['options']}
            {...column.props as Arco.CheckboxGroupInstance['$props']}
          >
            {{ ...column.slots }}
          </a-checkbox-group>
        )
      case 'date-picker':
        return (
          <a-date-picker
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            size={size.value}
            {...column.props as Arco.DatePickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-date-picker>
        )
      case 'time-picker':
        return (
          <a-time-picker
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            size={size.value}
            {...column.props as Arco.TimePickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-time-picker>
        )
      case 'rate':
        return (
          <a-rate
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            {...column.props as Arco.RateInstance['$props']}
          >
            {{ ...column.slots }}
          </a-rate>
        )
      case 'switch':
        return (
          <a-switch
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            size={size.value}
            {...column.props as Arco.SwitchInstance['$props']}
          >
            {{ ...column.slots }}
          </a-switch>
        )
      case 'slider':
        return (
          <a-slider
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field)}
            {...column.props as Arco.SliderInstance['$props']}
          >
            {{ ...column.slots }}
          </a-slider>
        )
      case 'customize':
        return column.render && column.render(props.modelValue[column.field as keyof typeof props.modelValue])
    }
  }
  const valueChange = (value: any, field: string) => {
    emit('update:modelValue', Object.assign(props.modelValue, { [field]: value }))
  }
  const onSubmit = (data: { values: Record<string, any>; errors: Record<string, ValidatedError> | undefined }) => {
    emit('submit', data)
  }
  const onReset = () => {
    emit('reset')
  }
  const onCancel = () => {
    emit('cancel')
  }
  expose({ formRef, valueChange })
  return () => (
    <>
      <a-form autoLabelWidth={props.options.form.autoLabelWidth ?? true} size={size.value} model={props.modelValue} ref={formRef} {...props.options.form} {...attrs} onSubmit={onSubmit}>
        <a-row gutter={props.options.row?.gutter || 16} {...props.options.row}>
          {
            props.options.columns.map((item, index) => (
              !item.hide &&
              <a-col span={item.span || 24} {...item.col} key={index}>
                <a-form-item field={item.field} label={item.label} rules={item.rules} {...item.item}>
                  {renderInput(item)}
                </a-form-item>
              </a-col>
            ))
          }
          {
            !props.options.btns?.hide &&
            <a-col span={props.options.btns?.col?.span || 24} style="text-align: right;" {...props.options.btns?.col}>
              <a-space size={size.value}>
                {!props.options.btns?.cancelHide && <a-button onClick={onCancel} size={size.value}>{t('global.form.cancel')}</a-button>}
                {!props.options.btns?.resetHide && <a-button onClick={onReset} size={size.value}>{t('global.form.reset')}</a-button>}
                {!props.options.btns?.submitHide && <a-button html-type="submit" size={size.value} type="primary">{t('global.form.submit')}</a-button>}
              </a-space>
            </a-col>
          }
        </a-row>
      </a-form>
    </>
  )
}, {
  emits: ['submit', 'reset', 'cancel', 'update:modelValue'],
  props: {
    modelValue: {
      type: Object as PropType<any>,
      default: {},
    },
    options: {
      type: Object as PropType<FormSpace.Options>,
      default: {},
    }
  },
})