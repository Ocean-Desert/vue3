import { defineComponent, PropType, reactive, ref, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { sendEmailCode, register } from '@/api/common'
import { useI18n } from 'vue-i18n'
import { RegisterData } from '@/api/common/type'
import { to } from '@/utils'

export interface RegisterFormProps {
  onSuccess: () => void
} 

export default defineComponent({
  props: {
    onSuccess: {
      type: Function as PropType<RegisterFormProps['onSuccess']>,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n()
    const formRef = ref()
    const loading = ref(false)
    const timer = ref<number>()
    const countdown = ref(0)

    const form = reactive<RegisterData>({
      username: '',
      password: '',
      email: '',
      code: ''
    })

    const rules = {
      username: [{ required: true, message: t('register.username.required') }],
      password: [
        { required: true, message: t('register.password.required') },
        { match: /^[0-9a-zA-Z]{5,}$/, message: t('register.password.pattern') }
      ],
      email: [
        { required: true, message: t('register.email.required') },
        { type: 'email', message: t('register.email.pattern') }
      ],
      code: [{ required: true, message: t('register.code.required') }]
    }

    const sendCode = async () => {
      if (!form.email) {
        Message.warning(t('register.email.required'))
        return
      }
      loading.value = true
      const [err, response] = await to<Promise<ApiSpace.Result<string>>>(sendEmailCode(form.email), () => {
        loading.value = false
      })
      if (!err) {
        Message.success(t('register.code.sent'))
        countdown.value = 60
        clearInterval(timer.value)
        timer.value = window.setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) {
            clearInterval(timer.value)
          }
        }, 1000)
      }
    }

    const handleSubmit = async ({ errors, values }: any) => {
      if (!errors) {
        loading.value = true
        const [err, response] = await to<Promise<ApiSpace.Result<string>>>(register(form), () => {
          loading.value = false
        })
        if (!err) {
          Message.success(t('register.success'))
          props.onSuccess()
        }
      }
    }

    onUnmounted(() => {
      if (timer.value) {
        clearInterval(timer.value)
      }
    })

    return () => (
      <a-form ref={formRef} model={form} rules={rules} onSubmit={handleSubmit} layout="vertical">
        <a-form-item 
          rules={[{ required: true, message: t('register.username.required') }]}
          validate-trigger={['change', 'blur']} 
          hide-label 
          field="username"
        >
          <a-input 
            v-model={form.username} 
            placeholder={t('register.username.placeholder')} 
            allow-clear
          >
            {{ prefix: () => <icon-user /> }}
          </a-input>
        </a-form-item>
        
        <a-form-item 
          rules={[
            { required: true, message: t('register.password.required') },
            { match: /^[0-9a-zA-Z]{5,}$/, message: t('register.password.pattern') }
          ]}
          validate-trigger={['change', 'blur']} 
          hide-label 
          field="password"
        >
          <a-input-password 
            v-model={form.password} 
            placeholder={t('register.password.placeholder')} 
            allow-clear
          >
            {{ prefix: () => <icon-lock /> }}
          </a-input-password>
        </a-form-item>
        
        <a-form-item 
          rules={[
            { required: true, message: t('register.email.required') },
            { type: 'email', message: t('register.email.pattern') }
          ]}
          validate-trigger={['change', 'blur']} 
          hide-label 
          field="email"
        >
          <a-input 
            v-model={form.email} 
            placeholder={t('register.email.placeholder')} 
            allow-clear
          >
            {{ prefix: () => <icon-email /> }}
          </a-input>
        </a-form-item>
        
        <a-form-item 
          rules={[{ required: true, message: t('register.code.required') }]}
          validate-trigger={['change', 'blur']} 
          hide-label 
          field="code"
        >
          <a-space>
            <a-input 
              v-model={form.code} 
              placeholder={t('register.code.placeholder')} 
              allow-clear
            >
              {{ prefix: () => <icon-safe /> }}
            </a-input>
            <a-button
              type="primary"
              onClick={sendCode}
              disabled={countdown.value > 0}
              loading={loading.value}
            >
              {countdown.value > 0 ? `${countdown.value}s` : t('register.code.send')}
            </a-button>
          </a-space>
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" html-type="submit" long loading={loading.value}>
            {t('register.submit')}
          </a-button>
        </a-form-item>
      </a-form>
    )
  }
}) 