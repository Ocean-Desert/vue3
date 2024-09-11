import { SysMenu } from '@/api/menus/type'
import { RouteRecordRaw } from 'vue-router'

const modules: Record<string, any> = import.meta.glob('@/views/**/*.tsx')

const buildRouters = (data: SysMenu[]): RouteRecordRaw[] => {
  const routers = data?.map((item: SysMenu) => {
    return {
      name: item.name,
      path: item.path,
      component: modules[`/src/views/${item.component}.tsx`],
      children: item.children && routerChildren(item.children),
      meta: {
        id: item.id,
        title: item.title,
        type: item.type,
        sort: item.sort,
        icon: item.icon,
        noAffix: false,
        keepAlive: item.keepAlive,
        permission: [...item.permission.split(',')],
        requiresAuth: item.requiresAuth || true,
      }
    } as RouteRecordRaw
  })
  return [...routers] as RouteRecordRaw[]
}

const routerChildren = (children: SysMenu[]) => buildRouters(children)

export { buildRouters }