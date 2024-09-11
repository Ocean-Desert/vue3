import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'
import createRouteGuard from './guard'
import { appRoutes, internalRoutes } from './routes'
import { STATIC } from './static'
import { LAYOUT, REDIRECT_MAIN } from './routes/base'
import 'nprogress/nprogress.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [LAYOUT, REDIRECT_MAIN, ...internalRoutes, ...STATIC],
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

createRouteGuard(router)

export default router