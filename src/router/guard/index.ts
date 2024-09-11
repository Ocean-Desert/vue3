import type { Router } from 'vue-router'
import setupUserLoginInfoGuard from './userLoginInfo'
import setupPermissionGuard from './permission'
import { setRouteEmitter } from '@/utils/routeListener'

const setupPageGuard = (router: Router) => {
  router.beforeEach(async to => {
    setRouteEmitter(to)
  })
}

const createRouteGuard = (router: Router) => {
  setupPageGuard(router)
  setupUserLoginInfoGuard(router)
  setupPermissionGuard(router)
}

export default createRouteGuard