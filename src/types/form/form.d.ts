import type { PropType } from 'vue'

declare const _default: import('vue').DefineComponent<{
  modelValue: {
    type: ObjectConstructor,
    default: () => {},
  },
  options: {
    type: PropType<FormSpace.Options>,
    default: () => {},
  }
}, {
  formRef: import('@arco-design/web-vue').FormInstance
  render: () => JSX.Element
}, unknown, {},
  {
    valueChange(record: import('@arco-design/web-vue').TableData): void
  }, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    'update:modelValue': (value: import('@arco-design/web-vue').TableData) => true
    submit: () => true
    cancel: () => true
    reset: () => true
  }, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
    modelValue?: unknown
    options?: unknown
  }>, {}>

export default _default