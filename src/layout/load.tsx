import { LayoutName, NOT_FOUND } from '@/router/constant'
import { useAppStore } from '@/store'
import { defineComponent, onMounted, watchEffect } from 'vue'
import { Router, RouteRecordName, RouteRecordRaw, useRouter } from 'vue-router'
import style from './index.module.scss'
import { useI18n } from 'vue-i18n'
import { buildRouters } from '@/hooks/router'
import usePermission from '@/hooks/permission'
import { DYNAMIC_ROUTES } from '@/router/static'
import appClientMenus from '@/router/menus'

export default defineComponent(() => {
  const router = useRouter()
  const appStore = useAppStore()
  const permission = usePermission()
  const { t } = useI18n()
  // watchEffect(() => {
  //   if (appStore.getRouteReady) {
  //     const routerList = router.getRoutes()
  //     debugger
  //     if (routerList.find(item => item.path === router.currentRoute.value.fullPath)) {
  //       router.push(router.currentRoute.value.fullPath)
  //     } else {
  //       router.push(NOT_FOUND)
  //     }
  //   }
  // })
  const menuFromLocalInit = () => {
    debugger
    addRoute(router, appClientMenus, LayoutName)
    
    // 获取当前路由信息
    const { query, fullPath } = router.currentRoute.value
    
    // 先尝试解析重定向路径
    if (query.redirect) {
      const redirectRoute = router.resolve(query.redirect as string)
      if (redirectRoute.matched.length) {
        return router.push(redirectRoute.fullPath)
      }
    }

    // 如果没有重定向或重定向无效，尝试解析当前路径
    const currentRoute = router.resolve(fullPath)
    if (currentRoute.matched.length) {
      return router.push(fullPath)
    }

    // 如果当前路径也无效，跳转到404
    router.push(NOT_FOUND)
  }

  const menuFromServerInit = async () => {
    debugger
    try {
      if (!appStore.getMenus.length) await appStore.fetchMenus()
      const serverMenus = buildRouters(appStore.getMenus)
      addRoute(router, serverMenus, LayoutName)
      const asyncRoutes = filterDynamicRoutes(DYNAMIC_ROUTES)
      addRoute(router, asyncRoutes)

      // 等待路由注册完成
      await router.isReady()

      const { redirect, ...otherQuery } = router.currentRoute.value.query
      
      // 处理重定向参数
      if (redirect) {
        // 防止redirect=load导致的循环
        if (redirect === LayoutName) {
          const dashboardRoute = router.resolve('dashboard')
          if (dashboardRoute.matched.length) {
            return router.push({
              path: 'dashboard',
              query: otherQuery
            })
          }
        }
        
        // 尝试解析重定向路径
        const targetPath = router.resolve(redirect as string)
        if (targetPath.matched.length) {
          return router.push({
            path: targetPath.path,
            query: otherQuery
          })
        }
      }
      
      // 尝试解析当前路径
      const { path, name } = router.currentRoute.value
      if (name !== 'load') {
        const targetRoute = router.resolve(name as string)
        if (targetRoute.matched.length) {
          return router.push({
            path: path,
            query: otherQuery
          })
        }
      }

      // 如果所有路径都无效，跳转到404
      router.push(NOT_FOUND)
    } catch (error) {
      console.error('Failed to initialize menu', error)
      router.push(NOT_FOUND)
    }
  }
  const addRoute = (router: Router, routers: RouteRecordRaw[], routeName?: RouteRecordName): void => {
    routers.forEach((item: RouteRecordRaw) => {
      if (!router.hasRoute(item.name as RouteRecordName)) {
        // 修复类型错误问题
        const routeRecordName = item.name as NonNullable<RouteRecordName>
        if (routeName) {
          router.addRoute(routeName, item)
        } else {
          router.addRoute(item)
        }
      }
    })
  }
  const filterDynamicRoutes = (routers: RouteRecordRaw[]): RouteRecordRaw[] => {
    const permission = usePermission()
    const res: RouteRecordRaw[] = []
    routers.forEach(route => {
      if (permission.accessRouter(route)) {
        res.push(route)
      }
    })
    return res
  }
  onMounted(() => {
    appStore.menuFromServer ? menuFromServerInit() : menuFromLocalInit()
  })
  return () => (
    <>
      <div class={style.load}>
        <a-spin dot tip={t('global.load')} size={25} />
      </div>
    </>
  )
})