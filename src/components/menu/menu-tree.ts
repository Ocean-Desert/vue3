import { computed } from 'vue'
import { useAppStore } from '@/store'
import appClientMenus from '@/router/menus/index'
import { cloneDeep } from 'lodash'
import { RouteRecordNormalized, RouteRecordRaw } from 'vue-router'
import usePermission from '@/hooks/permission'
import { buildRouters } from '@/hooks/router'


const useMenuTree = () => {
  const appStore = useAppStore()
  const permission = usePermission()
  const appRoute = computed(() => {
    if (appStore.menuFromServer) {
      return buildRouters(appStore.getMenus)
    }
    return appClientMenus
  })

  const menuTree = computed(() => {
    const copyRouter = cloneDeep(appRoute.value) as RouteRecordNormalized[]
    copyRouter.sort((a: RouteRecordNormalized, b: RouteRecordNormalized) => {
      return (a.meta.sort || 0) - (b.meta.sort || 0)
    })
    const travel = (_routes: RouteRecordRaw[], layer: number) => {

      if (!_routes) return null
      const collector: any = _routes.map(el => {
        // 校验路由
        if (!permission.accessRouter(el)) {
          return null
        }

        // 空子节点构建
        if (!el.children || el.children.length === 0) {
          el.children = []
          return el
        }

        const subItem = travel(el.children, layer + 1)

        if (subItem.length) {
          el.children = subItem
          return el
        }

        if (layer > 1) {
          el.children = subItem
          return el
        }
        return null
      })
      return collector.filter(Boolean)
    }
    return travel(copyRouter, 0)
  })
  return { menuTree }
}

export default useMenuTree