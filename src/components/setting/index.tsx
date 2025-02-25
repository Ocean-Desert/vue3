import { useAppStore } from '@/store'
import { computed, defineComponent } from 'vue'
import type { SetupContext } from 'vue'
import style from './index.module.scss'
import Block, { OptionsProps } from './block'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'
import { cloneDeep } from 'lodash-es'
import type { AppState } from '@/store/modules/app/type'

export default defineComponent((props: Record<string, any>, { emit }: SetupContext) => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const { text, copy, copied, isSupported } = useClipboard()
  const visible = computed(() => appStore.globalSettings)
  const setVisible = () => {
    appStore.updateAppSetting({ globalSettings: true })
  }
  const copySettings = async () => {
     if (!isSupported.value) {
      Message.error(t('global.copy.fail'))
      return
    }
    const excludePrototype: { key: keyof AppState; defaultValue: any }[] = [
      { key: 'security', defaultValue: { publicKey: '', privateKey: '' } },
      { key: 'userMenus', defaultValue: [] },
      { key: 'publicKey', defaultValue: '' },
    ]
    const copyValue = cloneDeep(appStore.$state) as AppState
    excludePrototype.forEach(item => {
      (copyValue[item.key as keyof AppState] as any) = item.defaultValue
    })
    await copy(JSON.stringify(copyValue, null, 2))
    Message.success(t('global.copy.success'))
  }
  const appOpts = computed<OptionsProps[]>(() => [
    {
      name: t('global.setting.settings.navbar'),
      key: 'navbar',
      defaultValue: appStore.navbar,
    },
    {
      name: t('global.setting.settings.tabBar'),
      key: 'tabBar',
      defaultValue: appStore.tabBar,
    },
    {
      name: t('global.setting.settings.menu'),
      key: 'menu',
      defaultValue: appStore.menu,
    },
    {
      name: t('global.setting.settings.topMenu'),
      key: 'topMenu',
      defaultVal: appStore.topMenu,
    },
    {
      name: t('global.setting.settings.hideMenu'),
      key: 'hideMenu',
      defaultValue: appStore.hideMenu,
    },
    {
      name: t('global.setting.settings.menuFromServer'),
      key: 'menuFromServer',
      defaultValue: appStore.menuFromServer,
    },
    {
      name: t('global.setting.settings.menuWidth'),
      key: 'menuWidth',
      type: 'number',
      defaultValue: appStore.menuWidth,
    },
    {
      name: t('global.setting.settings.search'),
      key: 'search',
      defaultValue: appStore.search,
    },
    {
      name: t('global.setting.settings.size'),
      key: 'size',
      options: [
        { label: t('global.setting.settings.mini'), value: 'mini' },
        { label: t('global.setting.settings.small'), value: 'small' },
        { label: t('global.setting.settings.medium'), value: 'medium' },
        { label: t('global.setting.settings.large'), value: 'large' }
      ],
      type: 'select',
      defaultValue: appStore.size,
    }
  ])
  const othersOpts = computed<OptionsProps[]>(() => [
    {
      name: t('global.setting.settings.colorWeak'),
      key: 'colorWeak',
      defaultValue: appStore.colorWeak,
    }
  ])
  const cancel = () => {
    appStore.updateAppSetting({ globalSettings: false })
    emit('cancel')
  }
  return () => (
    <>
      {
        !appStore.navbar &&
        <div class={style.fixedSettings} onClick={setVisible}>
          <a-button type="primary" size={size.value}>
            {{ icon: () => <icon-settings /> }}
          </a-button>
        </div>
      }
      <a-drawer
        width={300}
        unmount-on-close
        visible={visible.value}
        cancel-text={t('global.setting.settings.close')}
        ok-text={t('global.setting.settings.copy')}
        onOk={copySettings}
        onCancel={cancel}
        okButtonProps={{ size: size.value }}
        cancelButtonProps={{ size: size.value }}
      >
        {{
          title: () => <>{t('global.setting.settings.title')}</>,
          default: () => <>
            <Block title={t('global.setting.settings.appSettings')} options={appOpts.value}></Block>
            <Block title={t('global.setting.settings.otherSettings')} options={othersOpts.value}></Block>
            <a-alert closable>{t('global.setting.settings.alertContent')}</a-alert>
          </>
        }}
      </a-drawer>
    </>
  )
}, {
  emits: ['cancel'],
})