import { ref, reactive, defineComponent, getCurrentInstance, onMounted, ComponentInternalInstance, computed } from 'vue'
import style from './index.module.scss'
import { useRouter } from 'vue-router'
import type { Captcha, LoginData } from '@/api/common/type'
import { captcha } from '@/api/common/index'
import { getConfig } from '@/api/system/config/index'
import { ValidatedError } from '@arco-design/web-vue/es/form/interface'
import { useAppStore, useUserStore } from '@/store'
import { buildRouters } from '@/hooks/router'
import { LayoutName } from '@/router/constant'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'

export default defineComponent((props, { attrs, slots, emit, expose }) => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const router = useRouter()
  const { t } = useI18n()
  const captchaOnOff = ref(false)
  const captchaImage = ref('')
  const loading = ref(false)

  const form = reactive<LoginData>({
    username: 'admin',
    password: '',
    captcha: '',
    uuid: '',
  })

  const initCaptcha = async () => {
    const { data } = await captcha()
    form.uuid = (data as Captcha).uuid as string
    captchaOnOff.value = (data as Captcha).captchaOnOff
    captchaImage.value = 'data:image/png;base64,' + (data as Captcha).img
  }
  const initPassword = async () => {
    const { data } = await getConfig('sys.account.password')
    form.password = data as string
  }
  const handleSubmit = async ({ errors, values }: {
    errors: Record<string, ValidatedError> | undefined
    values: Record<string, any>
  }) => {
    if (loading.value) return
    if (!errors) {
      loading.value = true
      try {
        await userStore.login(form as LoginData)
        await appStore.initPublicKey()
        const { redirect, ...othersQuery } = router.currentRoute.value.query
        router.push({
          name: (redirect as string) || LayoutName,
          query: {
            ...othersQuery
          }
        })
        Message.success({
          content: t('global.message.success'),
          closable: true
        })
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }
  }
  initCaptcha()
  initPassword()
  return () => (
    <>
      <div class={style.container}>
        <div class={style.loginForm}>
          <div class={style.loginTitle}>{t('views.login.title')}</div>
          <a-form model={form} ref="loginForm" onSubmit={handleSubmit} layout="vertical" size={size.value}>
            <a-form-item rules={[{ required: true, message: t('views.login.username') }]} validate-trigger={['change', 'blur']} hide-label field="username" feedback>
              <a-input v-model={form.username} placeholder={t('views.login.username')} allow-clear size={size.value}>{{ prefix: () => <icon-user /> }}</a-input>
            </a-form-item>
            <a-form-item rules={[{ required: true, message: t('views.login.password') }]} validate-trigger={['change', 'blur']} hide-label field="password" feedback>
              <a-input-password v-model={form.password} placeholder={t('views.login.password')} allow-clear size={size.value}>{{ prefix: () => <icon-lock /> }}</a-input-password>
            </a-form-item>
            {captchaOnOff.value &&
              <a-form-item rules={[{ required: true, message: t('views.login.captcha') }]} validate-trigger={['change', 'blur']} hide-label field="captcha" feedback>
                <div class={style.captcha}>
                  <a-input v-model={form.captcha} placeholder={t('views.login.captcha')} allow-clear size={size.value}>{{ prefix: () => <icon-code-sandbox /> }}</a-input>
                  <a-image class={style.captchaImage} onPreviewVisibleChange={initCaptcha} preview-visible={false} src={captchaImage.value ? captchaImage.value : 'some-error.png'} />
                </div>
              </a-form-item>
            }
            <a-form-item>
              <a-button type="primary" long loading={loading.value} html-type="submit" size={size.value}>{t('views.login.loginBtn')}</a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </>
  )
})