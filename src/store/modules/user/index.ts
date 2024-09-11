import { defineStore } from 'pinia'
import type { User, UserInfo } from './types'
import { setToken, clearToken } from '@/utils/auth'
import type { LoginData } from '@/api/common/type'
import { login, logout, userInfo } from '@/api/common'
import { useAppStore } from '@/store'
import { removeRouteListener } from '@/utils/routeListener'

const useUserStore = defineStore('user', {
  state: (): UserInfo => ({
    permissions: [],
    roles: [],
    userDetails: {},
  }),
  getters: {
    getUserInfo(state: UserInfo): UserInfo {
      return { ...state }
    }
  },
  actions: {
    async login(loginForm: LoginData) {
      try {
        const { data } = await login(loginForm)
        setToken(data as string)
      } catch (err) {
        clearToken()
        throw err
      }
    },
    async logout() {
      try {
        await logout()
      } finally {
        this.logoutCallBack()
      }
    },
    logoutCallBack() {
      const appStore = useAppStore()
      this.resetUserInfo()
      appStore.clearUserMenus()
      clearToken()
      removeRouteListener()
    },
    async userInfo() {
      const { data } = await userInfo()
      this.setUserInfo(data as UserInfo)
    },
    setUserInfo(partial: Partial<UserInfo>) {
      this.$patch(partial)
    },
    resetUserInfo() {
      this.$reset()
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        paths: ['permissions', 'roles', 'userDetails'],
        storage: localStorage
      }
    ]
  }
})

export default useUserStore