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
    addRoute(router, appClientMenus, LayoutName)
    const toRoute = router.resolve(router.currentRoute.value.fullPath)
    if (toRoute.matched.length > 1) {
      router.push(router.currentRoute.value.fullPath)
    } else {
      router.push(NOT_FOUND)
    }
  }

  const menuFromServerInit = async () => {
    try {
      if (!appStore.getMenus.length) await appStore.fetchMenus()
      const serverMenus = buildRouters(appStore.getMenus)
      addRoute(router, serverMenus, LayoutName)
      const asyncRoutes = filterDynamicRoutes(DYNAMIC_ROUTES)
      addRoute(router, asyncRoutes)

      // 等待路由注册完成
      await router.isReady()

      const { redirect, ...otherQuery } = router.currentRoute.value.query
      if (redirect) {
        // 重新解析路由,因为这时动态路由已经加载完成
        const targetPath = router.resolve({ name: redirect as string })
        if (targetPath.matched.length) {
          return router.push({
            name: redirect as string,
            query: otherQuery
          })
        }
      }
      
      // 没有有效的重定向目标时跳转到首页
      router.push({
        name: LayoutName,
        query: otherQuery
      })
    } catch (error) {
      console.error('Failed to initialize menu', error)
      router.push(NOT_FOUND)
    }
  }
  const addRoute = (router: Router, routers: RouteRecordRaw[], routeName?: RouteRecordName): void => {
    routers.forEach((item: RouteRecordRaw) => {
      if (!router.hasRoute(item.name as RouteRecordName)) {
        routeName ? router.addRoute(LayoutName, item) : router.addRoute(item)
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