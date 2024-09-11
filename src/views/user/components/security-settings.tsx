import { computed, defineComponent, reactive, ref } from 'vue'
import style from '../index.module.scss'
import FormComponent from '@/components/form'
import type { ValidatedError } from '@arco-design/web-vue'
import useUser from '@/hooks/user'
import { AppFormInstance } from '@/types/form'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'
import { EditPasswordParams } from '@/api/common/type'
import { editPassword } from '@/api/common'

interface EditPassword extends EditPasswordParams {
  confirmPassword?: string
}

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const { logout } = useUser()
  const size = computed(() => appStore.size)
  const formRef = ref<AppFormInstance>()
  const formModel = reactive<EditPassword>({
    newPassword: '',
    oldPassword: '',
    confirmPassword: '',
  })
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { cancelHide: true },
    columns: [{
      type: 'input-password',
      label: t('components.security-settings.051975-0'),
      field: 'oldPassword',
      item: { 
        validateTrigger: 'blur'
      },
      rules: [{ required: true, message: t('components.security-settings.051975-1') }]
    }, {
      type: 'input-password',
      label: t('components.security-settings.051975-2'),
      field: 'newPassword',
      item: {
        validateTrigger: 'blur'
      },
      rules: [{
        required: true,
        validator: (value, callback) => {
          return new Promise((resolve) => {
            if (!value) {
              callback(t('components.security-settings.051975-3'))
            }
            if (!/^.{6,}$/.test(value)) { 
              callback(t('components.security-settings.051975-4'))
            }
            resolve(undefined)
          })
        }
      }]
    }, {
      type: 'input-password',
      label: t('components.security-settings.051975-5'),
      field: 'confirmPassword',
      item: {
        validateTrigger: 'blur'
      },
      rules: [{
        required: true, 
        validator: (value, callback) => {
          return new Promise((resolve) => {
            if (!value) {
              callback(t('components.security-settings.051975-6'))
            }
            if (!/^.{6,}$/.test(value)) { 
              callback(t('components.security-settings.051975-4'))
            }
            if (value !== formModel.newPassword) {
              callback(t('components.security-settings.051975-7'))
            }
            resolve(undefined)
          })
        }
      }]
    }]
  }))
  const onSubmit = async (data: { values: EditPasswordParams; errors: Record<string, ValidatedError> | undefined }) => {
    if (!data.errors) {
      const target = { ...data.values }
      if (Reflect.has(target, 'confirmPassword')) Reflect.deleteProperty(target, 'confirmPassword')
      const { success } = await editPassword(target)
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