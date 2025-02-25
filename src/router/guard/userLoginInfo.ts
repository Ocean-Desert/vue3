import type { Router, LocationQueryRaw } from 'vue-router'
import { useUserStore } from '@/store'
import { isLogin } from '@/utils/auth'
import { AuthName } from '../constant'

const setupUserLoginInfoGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    if (isLogin()) {
      if (userStore?.roles?.length) {
        next()
      } else {
        try {
          await userStore.userInfo()
          next()
        } catch (error) {
          await userStore.logout()
          next({
            name: AuthName,
            query: {
              redirect: to.name,
              ...to.query,
            } as LocationQueryRaw,
          })
        }
      }
    } else {
      if (to.name === AuthName) {
        next()
        return
      }
      next({
        name: AuthName,
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      })
    }
  })
}

export default setupUserLoginInfoGuard