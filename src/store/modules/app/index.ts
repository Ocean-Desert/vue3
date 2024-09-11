import { defineStore } from 'pinia'
import { AppState } from './type'
import { menus } from '@/api/system/menus/index'
import AppSetting from '@/config/setting.json'
import { Notification, NotificationReturn } from '@arco-design/web-vue'
import { SysMenu } from '@/api/system/menus/type'
import { getPublicKey } from '@/api/common'
import { sessionStorage } from '@/utils/storage'
import { generateKeyPair } from '@/utils/security'

const useAppStore = defineStore('app', {
  state: (): AppState => ({ ...AppSetting } as AppState),

  getters: {
    getKeyPair(state: AppState): { publicKey: string, privateKey: string } {
      return state.security
    },
    getMenus(state: AppState): SysMenu[] {
      return state.userMenus
    },
    getRouteReady(state: AppState): boolean {
      return state.routeReady
    }
  },

  actions: {
    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark'
        document.body.setAttribute('arco-theme', 'dark')
      } else {
        this.theme = 'light'
        document.body.removeAttribute('arco-theme')
      }
    },
    updateAppSetting(partial: Partial<AppState>) {
      this.$patch(partial)
    },
    initKeyPair() { 
      const { privateKey, publicKey } = generateKeyPair()
      this.security.privateKey = privateKey
      this.security.publicKey = publicKey
    },
    async initPublicKey() { 
      const { data } = await getPublicKey()
      if (data) {
        this.publicKey = data
      }
    },
    async fetchMenus() {
      let notifyInstance: NotificationReturn | null = null
      try {
        notifyInstance = Notification.info({
          id: 'menuNotice',
          content: 'loading',
          closable: true,
        })
        const { data } = await menus()
        this.userMenus = data
        // addRouters(data)
        notifyInstance = Notification.success({
          id: 'menuNotice',
          content: 'success',
          closable: true,
        })
      } catch (e) {
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: 'error',
          closable: true,
        })
      }
    },
    clearUserMenus() {
      this.userMenus = []
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'app',
        storage: localStorage,
        paths: ['navbar', 'tabBar', 'menu', 'hideMenu', "locale", 'menuFromServer', 'menuWidth', 'userMenus', 'menuCollapse', "publicKey"]
      },
      {
        key: 'security',
        paths: ['security']
      }
    ]
  }
})

export default useAppStore

