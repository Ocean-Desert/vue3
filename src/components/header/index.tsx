import { computed, defineComponent, getCurrentInstance, inject, ref } from 'vue'
import { useDark, useToggle, useFullscreen } from '@vueuse/core'
import style from './index.module.scss'
import useUser from '@/hooks/user'
import IconPark from '@/components/icon'
import LayoutMenu from '@/components/menu/index'
import logoSrc from '@/assets/logo.png'
import { useAppStore, useUserStore } from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LOCALE_OPTIONS } from '@/locale'
import useLocale from '@/hooks/locale'
import { getAssetsFile } from '@/utils'

export default defineComponent(() => {
  const appStore = useAppStore()
  const userStore = useUserStore()
  const size = computed(() => appStore.size)
  const { logout } = useUser()
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const locales = [...LOCALE_OPTIONS]
  const { changeLocale, currentLocale } = useLocale()
  const userDetails = computed(() => {
    return userStore.getUserInfo.userDetails
  })
  const topMenu = computed(() => appStore.topMenu && appStore.menu && !appStore.hideMenu)
  const hideMenu = computed(() => appStore.hideMenu && appStore.menu)
  const theme = computed(() => {
    return appStore.theme
  })
  const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()
  const isDark = useDark({
    selector: 'body',
    attribute: 'arco-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'arco-theme',
    onChanged(dark: boolean) {
      appStore.toggleTheme(dark)
    },
  })
  const handleLogout = () => {
    logout()
  }
  const setVisible = () => {
    appStore.updateAppSetting({ globalSettings: true })
  }
  const icon = ref('icon-baseball-cap')
  const toggleTheme = useToggle(isDark)
  const gotoProfile = () => {
    router.push({ name: 'userProfile' })
  }
  const handleToggleTheme = () => {
    toggleTheme()
  }
  const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void
  return () => (
    <>
      <div class={style.header}>
        <div class={style.leftHeader}>
          <a-space>
            {
              hideMenu.value &&
              <icon-menu-fold style="font-size: 22px; cursor: pointer" onClick={toggleDrawerMenu} />
            }
            <img alt="logo" class={style.logo} src={logoSrc} />
            <a-typography-title style={{ margin: 0, fontSize: '18px' }} heading={5}>
              { t('global.name') }
            </a-typography-title>
          </a-space>
        </div>
        <div class={style.middleHeader}>
          {
            topMenu.value && <LayoutMenu />
          }
        </div>
        <ul class={style.rightHeader}>
          <li>
            <a-tooltip content={theme.value === 'light' ? t('global.setting.changeDark') : t('global.setting.changeLight')}>
              <a-button class={style.navBtn} type="outline" shape="circle" onClick={handleToggleTheme} size={size.value}>
                {{ icon: () => theme.value === 'dark' ? <icon-moon-fill /> : <icon-sun-fill /> }}
              </a-button>
            </a-tooltip>
          </li>
          <li>
            <a-dropdown trigger="click" onSelect={changeLocale}>
              {{
                default: () =>
                  <a-tooltip content={t('global.setting.language')}>
                  <a-button class={style.navBtn} type="outline" shape="circle" size={size.value}>
                    {{ icon: () => <icon-language /> }}
                  </a-button>
                </a-tooltip>,
                content: () =>
                  <>
                    {
                      locales.map((item, index) => (
                        <a-doption key={index} value={item.value}>
                          {{
                            default: () => <span>{item.label}</span>,
                            icon: () => item.value === currentLocale.value ? <icon-check /> : null
                          }}
                        </a-doption>
                      ))
                    }
                  </>
               }}
            </a-dropdown>
          </li>
          <li>
            <a-tooltip content={isFullscreen.value ? t('global.setting.quitFullScreen') : t('global.setting.selectFullScreen')}>
              <a-button class={style.navBtn} type="outline" shape="circle" onClick={toggleFullScreen} size={size.value}>
                {{ icon: () => isFullscreen.value ? <icon-fullscreen-exit /> : <icon-fullscreen /> }}
              </a-button>
            </a-tooltip>
          </li>
          <li>
            <a-tooltip content={t('global.setting.settings')}>
              <a-button class={style.navBtn} type="outline" shape="circle" onClick={setVisible} size={size.value}>
                {{ icon: () => <icon-settings /> }}
              </a-button>
            </a-tooltip>
          </li>
          <li>
            <a-dropdown trigger="click">
              {{
                default: () =>
                  <a-avatar size={32} style="cursor: pointer;">
                    {
                      userDetails.value.avatar ? <img src={userDetails.value.avatar}></img> : <icon-user />
                    }
                  </a-avatar>,
                content: () =>
                  <>
                    <a-doption>
                      <a-space onClick={gotoProfile}>
                        <icon-user />
                        <span>{t('global.setting.userProfile')}</span>
                      </a-space>
                    </a-doption>
                    <a-doption>
                      <a-space onClick={handleLogout}>
                        <icon-export />
                        <span>{t('global.setting.logout')}</span>
                      </a-space>
                    </a-doption>
                  </>
              }}
            </a-dropdown>
          </li>
        </ul>
      </div>
    </>
  )
})