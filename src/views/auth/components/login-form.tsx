import { defineComponent, PropType, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useAppStore, useUserStore } from '@/store'
import { LayoutName, LoadName } from '@/router/constant'
import { useI18n } from 'vue-i18n'
import type { Captcha, LoginData } from '@/api/common/type'
import style from '../index.module.scss'

export interface LoginFormProps {
  captchaOnOff: boolean
  captchaImage: string
  onRefreshCaptcha: () => void
  uuid?: string
}

export default defineComponent({
  props: {
    captchaOnOff: {
      type: Boolean as PropType<LoginFormProps['captchaOnOff']>,
      default: false
    },
    captchaImage: {
      type: String as PropType<LoginFormProps['captchaImage']>,
      default: ''
    },
    onRefreshCaptcha: {
      type: Function as PropType<LoginFormProps['onRefreshCaptcha']>,
      required: true
    },
    uuid: {
      type: String as PropType<LoginFormProps['uuid']>,
      default: ''
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const appStore = useAppStore()
    const router = useRouter()
    const { t } = useI18n()
    const loading = ref(false)

    const form = reactive<LoginData>({
      username: 'admin',
      password: '',
      captcha: '',
      uuid: '',
    })

    const handleSubmit = async ({ errors, values }: any) => {
      if (loading.value) return
      if (!errors) {
        loading.value = true
        try {
          await userStore.login(form)
          await appStore.initPublicKey()
          debugger  
          const { redirect, ...othersQuery } = router.currentRoute.value.query
          const redirectTarget = redirect === LoadName ? 'dashboard' : (redirect || 'dashboard')
          
          router.push({
            name: LoadName,
            query: {
              redirect: redirectTarget,
              ...othersQuery
            }
          })
          
          Message.success(t('global.message.success'))
        } catch (e) {
          console.error(e)
        } finally {
          loading.value = false
        }
      }
    }

    watch(() => props.uuid, (newUuid) => {
      if (newUuid) {
        form.uuid = newUuid
      }
    }, { immediate: true })

    return () => (
      <a-form model={form} onSubmit={handleSubmit} layout="vertical">
        <a-form-item rules={[{ required: true, message: t('views.login.username') }]} 
          validate-trigger={['change', 'blur']} hide-label field="username">
          <a-input v-model={form.username} placeholder={t('views.login.username')} allow-clear>
            {{ prefix: () => <icon-user /> }}
          </a-input>
        </a-form-item>
        
        <a-form-item rules={[{ required: true, message: t('views.login.password') }]} 
          validate-trigger={['change', 'blur']} hide-label field="password">
          <a-input-password v-model={form.password} placeholder={t('views.login.password')} allow-clear>
            {{ prefix: () => <icon-lock /> }}
          </a-input-password>
        </a-form-item>
        
        {props.captchaOnOff && (
          <a-form-item rules={[{ required: true, message: t('views.login.captcha') }]} 
            validate-trigger={['change', 'blur']} hide-label field="captcha">
            <div class={style.captchaInput}>
              <a-input v-model={form.captcha} placeholder={t('views.login.captcha')} allow-clear>
                {{ prefix: () => <icon-code-sandbox /> }}
              </a-input>
              <a-image preview-visible={false} src={props.captchaImage} 
                onClick={props.onRefreshCaptcha} />
            </div>
          </a-form-item>
        )}
        
        <a-form-item>
          <a-button type="primary" html-type="submit" long loading={loading.value}>
            {t('views.login.loginBtn')}
          </a-button>
        </a-form-item>
      </a-form>
    )
  }
}) 