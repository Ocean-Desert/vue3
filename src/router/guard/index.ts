import type { Router } from 'vue-router'
import setupUserLoginInfoGuard from './userLoginInfo'
import setupPermissionGuard from './permission'
import { setRouteEmitter } from '@/utils/routeListener'
import NProgress from 'nprogress'

const setupPageGuard = (router: Router) => {
  router.beforeEach(async to => {
    setRouteEmitter(to)
  })
}

const setupProgressGuard = (router: Router) => {
  router.beforeEach(() => {
    NProgress.start()
  })
  router.afterEach(() => {
    NProgress.done()
  })
}

const createRouteGuard = (router: Router) => {
  setupProgressGuard(router)
  setupPageGuard(router)
  setupUserLoginInfoGuard(router)
  setupPermissionGuard(router)
}

export default createRouteGuard