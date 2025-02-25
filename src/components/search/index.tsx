import { PropType, SetupContext, computed, defineComponent, onMounted, ref, toValue } from 'vue'
import style from './index.module.scss'
import { hasProperty } from '@/utils'
import type * as Arco from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

interface Props {
  modelValue: object
  options: FormSpace.Options
}

export default defineComponent((props: Props, context: SetupContext) => {
  const { slots, attrs, emit, expose } = context
  const formRef = ref<Arco.FormInstance>()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const { t } = useI18n()
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
            allowClear={true}
            placeholder={t('global.search.tip.input') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.InputInstance['$props']}
          >
            {{ ...column.slots }}
          </a-input>
        )
      case 'input-number':
        return (
          <a-input-number
            placeholder={t('global.search.tip.input') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.InputNumberInstance['$props']}
          >
            {{ ...column.slots }}
          </a-input-number>
        )
      case 'textarea':
        return (
          <a-textarea
            allowClear={true}
            placeholder={t('global.search.tip.input') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            {...column.props as Arco.TextareaInstance['$props']}
          >
            {{ ...column.slots }}
          </a-textarea>
        )
      case 'select':
        checkOptions(column)
        return (
          <a-select
            allowClear={true}
            placeholder={t('global.search.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            options={column.options as Arco.SelectInstance['$props']['options']}
            size={size.value}
            {...column.props as Arco.SelectInstance['$props']}
          >
            {{ ...column.slots }}
          </a-select>
        )
      case 'cascader':
        checkOptions(column)
        return (
          <a-cascader
            allowClear={true}
            placeholder={t('global.search.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
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
            allowClear={true}
            placeholder={t('global.search.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
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
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
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
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            options={column.options as Arco.CheckboxGroupInstance['$props']['options']}
            {...column.props as Arco.CheckboxGroupInstance['$props']}
          >
            {{ ...column.slots }}
          </a-checkbox-group>
        )
      case 'date-picker':
        return (
          <a-date-picker
            allowClear={true}
            placeholder={t('global.search.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.DatePickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-date-picker>
        )
      case 'month-picker':
        return (
          <a-month-picker
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.MonthPickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-month-picker>
        )
      case 'year-picker':
        return (
          <a-year-picker
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.MonthPickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-year-picker>
        )
      case 'quarter-picker':
        return (
          <a-quarter-picker
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.QuarterPickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-quarter-picker>
        )
      case 'week-picker':
        return (
          <a-week-picker
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.WeekPickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-week-picker>
        )
      case 'range-picker':
        return (
          <a-range-picker
            placeholder={t('global.form.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.RangePickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-range-picker>
        )
      case 'time-picker':
        return (
          <a-time-picker
            allowClear={true}
            placeholder={t('global.search.tip.select') + column.label}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            size={size.value}
            {...column.props as Arco.TimePickerInstance['$props']}
          >
            {{ ...column.slots }}
          </a-time-picker>
        )
      case 'rate':
        return (
          <a-rate
            allowClear={true}
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            {...column.props as Arco.RateInstance['$props']}
          >
            {{ ...column.slots }}
          </a-rate>
        )
      case 'switch':
        return (
          <a-switch
            modelValue={props.modelValue[column.field as keyof typeof props.modelValue]}
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
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
            onUpdate:modelValue={(value: any) => valueChange(value, column.field, column.ignore)}
            {...column.props as Arco.SliderInstance['$props']}
          >
            {{ ...column.slots }}
          </a-slider>
        )
      case 'customize':
        return column.render && column.render(props.modelValue[column.field as keyof typeof props.modelValue])
    }
  }
  const valueChange = (value: any, field: string, ignore = false) => {
    emit('update:modelValue', ignore? props.modelValue : {...props.modelValue, [field]: value })
  }
  const onSearch = () => {
    emit('search')
  }
  const onReset = () => {
    emit('reset')
  }
  expose({ formRef, valueChange })
  return () => (
    <>
      <a-row align={'stretch'}>
        <a-col flex={1}>
          <a-form autoLabelWidth={true} size={size.value} model={props.modelValue} ref={formRef} {...props.options.form} {...attrs}>
            <a-row gutter={16} {...props.options.row}>
              {
                props.options.columns.map((item, index) => {
                  return (
                    <a-col span={item.span || 8} {...item.col} key={index}>
                      <a-form-item field={item.field} label={item.label} rules={item.rules} {...item.item}>
                        {renderInput(item)}
                      </a-form-item>
                    </a-col>
                  )
                })
              }
            </a-row>
          </a-form>
        </a-col>
        {
          !props.options.btns?.hide &&
          <>
            <a-divider direction="vertical" />
            <a-col span={props.options.btns?.span || 12} flex="86px" style="text-align: right" {...props.options.btns?.col}>
              <a-space direction="vertical" size={size.value}>
                <a-button type="primary" onClick={onSearch} size={size.value}>
                  {{ icon: () => <icon-search />, default: () => t('global.search.submit') }}
                </a-button>
                <a-button onClick={onReset} size={size.value}>
                  {{ icon: () => <icon-refresh />, default: () => t('global.search.reset') }}
                </a-button>
              </a-space>
            </a-col>
          </>
        }
      </a-row>
    </>
  )
}, {
  emits: ['search', 'reset', 'update:modelValue'],
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