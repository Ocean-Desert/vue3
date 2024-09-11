import { useUserStore } from '@/store'
import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { SysRole } from '@/store/modules/user/types'

const usePermission = () => {
  const userStore = useUserStore()
  return {
    findUserPermission(permission: string[]) {
      const clonePermissions = [...userStore.permissions]
      return permission.filter(item => clonePermissions.includes(item)).length > 0
    },
    findUserRole() {
      const cloneRoleList = [...userStore.roleList]
      return cloneRoleList.map((item: SysRole) => item.string) as string[]
    },
    findPermissionRoute(routers: any, permissions: string[]) {
      const cloneRouters = [...routers]
      while (cloneRouters.length) {
        const first = cloneRouters.shift()
        if (permissions.find(el => el === first?.meta?.permission)) return { name: first.name }
        if (first?.children) cloneRouters.push(...first.children)
      }
      return false
    },
    accessRouter(route: RouteLocationNormalized | RouteRecordRaw) {
      return (
        !route.meta?.requiresAuth ||
        !route.meta?.permissions ||
        route.meta?.permissions.includes('*') ||
        this.findUserPermission(route.meta?.permissions)
      )
    },
  }
}

export default usePermission