import { ref, defineComponent, onMounted, computed } from 'vue'
import { useAppStore } from '@/store'
import { captcha } from '@/api/common'
import LoginForm from './components/login-form'
import RegisterForm from './components/register-form'
import BeianFooter from './components/beian-footer'
import style from './index.module.scss'
import { getConfig } from '@/api/system/config'
import { getAssetsFile } from '@/utils'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const theme = computed(() => appStore.theme)
  const captchaOnOff = ref(false)
  const captchaImage = ref('')
  const registerOnOff = ref(false)
  const showRegister = ref(false)
  const captchaUuid = ref('')

  const initCaptcha = async () => {
    const { data } = await captcha()
    captchaOnOff.value = data?.captchaOnOff ?? true
    captchaImage.value = 'data:image/gif;base64,' + data?.img
    captchaUuid.value = data?.uuid ?? ''
  }

  const initRegister = async () => {
    const { data } = await getConfig('sys.account.register')
    registerOnOff.value = Boolean(data)
  }

  const toggleForm = () => {
    showRegister.value = !showRegister.value
  }

  onMounted(() => {
    initCaptcha()
    initRegister()
  })

  return () => (
    <div class={style.loginContainer} 
      style={{
        backgroundImage: theme.value === 'light' 
          ? 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'
          : 'linear-gradient(45deg, #93a5cf 0%, #e4efe9 100%)'
      }}>
      <div class={style.loginBox}>
        <div class={style.loginLeft}>
          <div class={style.loginTitle}>
            <img src={getAssetsFile('logo.png')} alt="logo" class={style.logo} />
            <h2>{t('auth.index.262116-0')}</h2>
          </div>
          <div class={style.loginDesc}>
            <p>{t('auth.index.262116-1')}</p>
          </div>
        </div>
        
        <div class={style.loginRight}>
          <div class={style.loginForm}>
            <h3>{showRegister.value ? t('auth.index.262116-2') : t('auth.index.262116-3')}</h3>
            {showRegister.value ? (
              <RegisterForm onSuccess={() => {
                showRegister.value = false
                Message.success(t('auth.index.262116-4'))
              }} />
            ) : (
              <LoginForm
                captchaOnOff={captchaOnOff.value}
                captchaImage={captchaImage.value}
                onRefreshCaptcha={initCaptcha}
                uuid={captchaUuid.value}
              />
            )}
            
            {registerOnOff.value && (
              <div class={style.formSwitch}>
                <a-link onClick={toggleForm}>
                  {showRegister.value ? t('auth.index.262116-5') : t('auth.index.262116-6')}
                </a-link>
              </div>
            )}
          </div>
        </div>
      </div>
      <BeianFooter />
    </div>
  )
})