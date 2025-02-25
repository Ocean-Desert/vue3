import type { Router, RouteRecordName, RouteRecordNormalized, RouteRecordRaw } from 'vue-router'
import usePermission from '@/hooks/permission'
import { WHITE_LIST, NOT_FOUND, INTERNAL, BASE, LayoutName } from '@/router/constant'
import { useAppStore } from '@/store'
import { appRoutes, internalRoutes } from '../routes'
import appClientMenus from '@/router/menus/index'
import { DYNAMIC_ROUTES } from '../static'

const setupPermissionGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    const appStore = useAppStore()
    const permission = usePermission()
    const permissionsAllow = permission.accessRouter(to) // 校验路由格式
    if (appStore.menuFromServer) {
      // 如果是白名单路由，直接放行
      if (WHITE_LIST.some(item => item.name === to.name)) {
        next()
        return
      }

      // 需要获取菜单数据
      if (!appStore.getMenus.length) { 
        await appStore.fetchMenus()
        next({ name: to.name as string })
        return
      }
      
      const serverMenus = [...appStore.getMenus, ...DYNAMIC_ROUTES, ...WHITE_LIST, ...INTERNAL, ...BASE]
      const exist = isExistMenus(serverMenus)
      if (exist && permissionsAllow) {
        next()
      } else {
        next(NOT_FOUND)
      }
    } else {
      // 路由是本地的
      const appMenus = [...appClientMenus, ...WHITE_LIST, ...INTERNAL, ...BASE]
      const exist = isExistMenus(appMenus)
      if (exist && permissionsAllow) {
        next()
      } else {
        const destination = permission.findPermissionRoute([...appRoutes, ...internalRoutes], permission.findUserPermission()) || { name: NotFoundName }
        next(destination)
      }
    }

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

export default setupPermissionGuard