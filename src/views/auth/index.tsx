import { ref, reactive, defineComponent, computed, onMounted } from 'vue'
import style from './index.module.scss'
import { useRouter } from 'vue-router'
import type { Captcha, LoginData } from '@/api/common/type'
import { captcha } from '@/api/common/index'
import { getConfig } from '@/api/system/config/index'
import { ValidatedError } from '@arco-design/web-vue/es/form/interface'
import { useAppStore, useUserStore } from '@/store'
import { LayoutName, LoadName, RegisterName } from '@/router/constant'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { getAssetsFile } from '@/utils'
import Footer from '@/components/footer'

export default defineComponent(() => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const theme = computed(() => appStore.theme)
  const router = useRouter()
  const { t } = useI18n()
  const captchaOnOff = ref(false)
  const captchaImage = ref('')
  const registerOnOff = ref(false)
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

  const initRegister = async () => {
    const { data } = await getConfig('sys.account.register')
    registerOnOff.value = Boolean(data)
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
        if (redirect === LoadName) {
          router.push({
            name: LayoutName,
            query: othersQuery
          })
        } else {
          router.push({
            name: (redirect as string) || LayoutName,
            query: othersQuery
          })
        }
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
  onMounted(() => {
    initCaptcha()
    initPassword()
    initRegister()
  })
  return () => (
    <div 
      class={style.loginContainer} 
      style={{
        backgroundImage: theme.value === 'light' 
          ? 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'
          : 'linear-gradient(45deg, #93a5cf 0%, #e4efe9 100%)'
      }}
    >
      <div class={style.loginBox}>
        <div class={style.loginLeft}>
          <div class={style.loginTitle}>
            <img src={getAssetsFile('logo.png')} alt="logo" class={style.logo} />
            <h2>后台管理系统</h2>
          </div>
          <div class={style.loginDesc}>
            <p>欢迎使用后台管理系统</p>
          </div>
        </div>
        
        <div class={style.loginRight}>
          <div class={style.loginForm}>
            <h3>用户登录</h3>
            <a-form model={form} ref="loginForm" onSubmit={handleSubmit} layout="vertical" size={size.value}>
              <a-form-item rules={[{ required: true, message: t('views.login.username') }]} 
                validate-trigger={['change', 'blur']} hide-label field="username" feedback>
                <a-input v-model={form.username} placeholder={t('views.login.username')} 
                  allow-clear size={size.value}>
                  {{ prefix: () => <icon-user /> }}
                </a-input>
              </a-form-item>
              
              <a-form-item rules={[{ required: true, message: t('views.login.password') }]} 
                validate-trigger={['change', 'blur']} hide-label field="password" feedback>
                <a-input-password v-model={form.password} placeholder={t('views.login.password')} 
                  allow-clear size={size.value}>
                  {{ prefix: () => <icon-lock /> }}
                </a-input-password>
              </a-form-item>
              
              {captchaOnOff.value && (
                <a-form-item rules={[{ required: true, message: t('views.login.captcha') }]} 
                  validate-trigger={['change', 'blur']} hide-label field="captcha" feedback>
                  <div class={style.captcha}>
                    <a-input v-model={form.captcha} placeholder={t('views.login.captcha')} 
                      allow-clear size={size.value}>
                      {{ prefix: () => <icon-code-sandbox /> }}
                    </a-input>
                    <a-image class={style.captchaImage} onPreviewVisibleChange={initCaptcha} 
                      preview-visible={false} 
                      src={captchaImage.value ? captchaImage.value : 'some-error.png'} />
                  </div>
                </a-form-item>
              )}
              
              <a-form-item>
                <a-button type="primary" long loading={loading.value} 
                  html-type="submit" size={size.value}>
                  {t('views.login.loginBtn')}
                </a-button>
              </a-form-item>

              {registerOnOff.value && (
                <div class={style.registerLink}>
                  <a-link onClick={() => router.push({ name: RegisterName })}>还没有账号？立即注册</a-link>
                </div>
              )}
            </a-form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
})