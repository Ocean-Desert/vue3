import type { Router, RouteRecordName, RouteRecordNormalized, RouteRecordRaw } from 'vue-router'
import usePermission from '@/hooks/permission'
import { WHITE_LIST, NOT_FOUND, INTERNAL, BASE, LayoutName, NotFoundName } from '@/router/constant'
import { useAppStore } from '@/store'
import { appRoutes, internalRoutes } from '../routes'
import appClientMenus from '@/router/menus/index'
import { DYNAMIC_ROUTES } from '../static'

const setupPermissionGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    const appStore = useAppStore()
    const permission = usePermission()
    const permissionsAllow = permission.accessRouter(to) // 校验路由格式
    // 如果是白名单路由，直接放行
    if (WHITE_LIST.some(item => item.name === to.name)) {
      next()
      return
    }
    
    
    if (appStore.menuFromServer) {
      // 需要获取菜单数据
      if (!appStore.getMenus.length) { 
        await appStore.fetchMenus()
        next({ path: to.fullPath }) // 使用完整路径保留查询参数
        return
      }
      
      const serverMenus = [...appStore.getMenus, ...DYNAMIC_ROUTES, ...WHITE_LIST, ...INTERNAL, ...BASE] as RouteRecordRaw[]
      const exist = isExistMenus(serverMenus)
      if (exist && permissionsAllow) {
        next()
      } else {
        next(NOT_FOUND)
      }
    } else {
      // 路由是本地的
      const appMenus = [...appClientMenus, ...WHITE_LIST, ...INTERNAL, ...BASE] as RouteRecordRaw[]
      const exist = isExistMenus(appMenus)
      if (exist && permissionsAllow) {
        next()
      } else {
        // 修复方法调用的参数问题
        const userPermissions = permission.findUserPermission()
        const destination = permission.findPermissionRoute([...appRoutes, ...internalRoutes], userPermissions) || { name: NotFoundName }
        next(destination)
      }
    }

    function isExistMenus(menus: RouteRecordRaw[]): boolean {
      let exist = false
      // 创建菜单副本进行检查，避免修改原始数组
      const menusCopy = [...menus]
      while (menusCopy.length && !exist) {
        const element = menusCopy.shift()
        if (element?.name === to.name) {
          exist = true
        }
        if (element?.children) {
          menusCopy.push(...(element.children as unknown as RouteRecordNormalized[]))
        }
      }
      return exist
    }
  })
}

export default setupPermissionGuard