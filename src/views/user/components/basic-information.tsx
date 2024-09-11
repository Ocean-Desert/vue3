import { useAppStore } from '@/store'
import { computed, defineComponent, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FormComponent from '@/components/form'
import type { ValidatedError } from '@arco-design/web-vue'
import { EditUserParams } from '@/api/common/type'
import { useDictSelect } from '@/hooks/options'
import { dict } from '@/api/system/dict'
import { editUser } from '@/api/common/index'
import style from '../index.module.scss'
import useUser from '@/hooks/user'
import { AppFormInstance } from '@/types/form'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const { logout } = useUser()
  const size = computed(() => appStore.size)
  const { options } = useDictSelect(async () => await dict('sys_user_sex'))
  const formRef = ref<AppFormInstance>()
  const formModel = reactive<EditUserParams>({
    nickName: '',
    phone: '',
    avatar: '',
    sex: '',
  })
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { cancelHide: true },
    columns: [{
      type: 'input',
      label: t('components.basic-information.931986-0'),
      field: 'nickName',
      rules: [{ required: true, message: t('components.basic-information.931986-1') }]
    }, {
      type: 'select',
      label: t('components.basic-information.931986-2'),
      field: 'sex',
      rules: [{ required: true, message: t('components.basic-information.931986-3') }],
      options: options.value
    }, {
      type: 'input',
      label: t('components.basic-information.931986-4'),
      field: 'phone',
      rules: [{
        required: true,
        validator: (value, callback) => {
          return new Promise((resolve) => {
            if (!value) {
              callback(t('components.basic-information.931986-5'))
            }
            if (!/^1[3-9]\d{9}$/.test(value)) {
              callback(t('components.basic-information.931986-6'))
            }
            resolve(undefined)
          })
        }
      }]
    }]
  }))
  const onSubmit = async (data: { values: EditUserParams; errors: Record<string, ValidatedError> | undefined }) => {
    if (!data.errors) {
      const target = { ...data.values }
      if (Reflect.has(target, 'avatar')) Reflect.deleteProperty(target, 'avatar')
      const { success } = await editUser(target)
      if (success) logout()
    }
  }
  const handleReset = async () => {
    await formRef.value?.formRef.resetFields()
  }
  return () => (
    <>
      <div class={style.userInfoForm}>
        <FormComponent
          ref={formRef}
          modelValue={formModel}
          options={formOptions.value}
          onSubmit={onSubmit}
          onReset={handleReset}
        >
        </FormComponent>
      </div>
    </>
  )
})