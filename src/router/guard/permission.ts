import type { Router, RouteRecordName, RouteRecordNormalized, RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import usePermission from '@/hooks/permission'
import { WHITE_LIST, NOT_FOUND, INTERNAL, BASE, LayoutName } from '@/router/constant'
import { useAppStore } from '@/store'
import { appRoutes, internalRoutes } from '../routes'
import { buildRouters } from '@/hooks/router'
import appClientMenus from '@/router/menus/index'
import { isLogin } from '@/utils/auth'
import { DYNAMIC_ROUTES } from '../static'

const setupPermissionGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    const appStore = useAppStore()
    const permission = usePermission()
    const permissionsAllow = permission.accessRouter(to) // 校验路由格式
    if (appStore.menuFromServer) {
      // 路由是动态的
      // 进入的路由是否是白名单或当前用户存在的
      const existMenu = !appStore.getMenus.length && !WHITE_LIST.find((el: any) => el.name === to.name)
      if (isLogin() && !appStore.routeReady || existMenu) {
        await appStore.fetchMenus() // 后端获取路由
        const routers = buildRouters(appStore.getMenus) // 解析路由解构
        addRoute(router, routers, LayoutName)
        const asyncRoutes = filterDynamicRoutes(DYNAMIC_ROUTES)
        addRoute(router, asyncRoutes)
        appStore.updateAppSetting({ routeReady: true }) // 当前用户的路由已经请求过了
      }
      // 最终拥有的路由
      const serverMenus = [...router.getRoutes(), ...WHITE_LIST, ...INTERNAL, ...BASE]
      const exist = isExistMenus(serverMenus) // 进入的路由是否存在
      if (exist && permissionsAllow) {
        next()
      } else {
        next(NOT_FOUND)
      }
    } else {
      // 路由是本地的
      const existMenu = !appClientMenus.length && !WHITE_LIST.find((el: any) => el.name === to.name)
      if (!appStore.routeReady || existMenu) {
        addRoute(router, appClientMenus, LayoutName)
        appStore.updateAppSetting({ routeReady: true })
      }
      const appMenus = [...router.getRoutes(), ...WHITE_LIST, ...INTERNAL, ...BASE]
      const exist = isExistMenus(appMenus)
      if (exist && permissionsAllow) {
        next()
      } else {
        const destination = permission.findPermissionRoute([...appRoutes, ...internalRoutes], permission.findUserPermission()) || NOT_FOUND
        next(destination)
      }
    }
    NProgress.done()

    function isExistMenus(menus: any[]): boolean {
      let exist = false
      while (menus.length && !exist) {
        const element = menus.shift()
        if (element?.name === to.name) {
          exist = true
        }
        if (element?.children) {
          menus.push(...(element.children as unknown as RouteRecordNormalized[]))
        }
      }
      return exist
    }
  })
}

function filterDynamicRoutes(routers: RouteRecordRaw[]): RouteRecordRaw[] {
  const permission = usePermission()
  const res: RouteRecordRaw[] = []
  routers.forEach(route => {
    if (permission.accessRouter(route)) {
      res.push(route)
    }
  })
  return res
}

function addRoute(router: Router, routers: RouteRecordRaw[], routeName?: RouteRecordName): void {
  routers.forEach((item: RouteRecordRaw) => {
    if (!router.hasRoute(item.name as RouteRecordName)) {
      routeName ? router.addRoute(LayoutName, item) : router.addRoute(item)
    }
  })
}

export default setupPermissionGuard