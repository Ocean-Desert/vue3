import { RouteRecordRaw } from 'vue-router'
import { LayoutName, REDIRECT_ROUTE_NAME } from '../constant'

export const Layout = () => import('@/layout/index')

export const LAYOUT: RouteRecordRaw = {
  path: '/',
  name: LayoutName,
  redirect: '/dashboard',
  component: Layout,
  meta: {
    sort: 0,
    requiresAuth: true,
    keepAlive: false,
    permissions: ['*'],
  },
  children: [
    // {
    //   path: 'dashboard',
    //   name: 'dashboard',
    //   component: () => import('@/views/dashboard/index.tsx'),
    //   meta: {
    //     keepAlive: false,
    //     requiresAuth: false, // 是否需要登录鉴权
    //     permissions: ['*'],
    //     // icon：菜单配置icon
    //     // locale：一级菜单名（语言包键名）
    //     // hideInMenu：是否在左侧菜单中隐藏该项
    //     // hideChildrenInMenu：强制在左侧菜单中显示单项
    //     // activeMenu：高亮设置的菜单项
    //     // order：排序路由菜单项。如果设置该值，值越高，越靠前
    //     // noAffix：如果设置为true，标签将不会添加到tab-bar中
    //     // ignoreCache：如果设置为true页面将不会被缓存
    //   },
    // }
  ]
}

export const REDIRECT_MAIN: RouteRecordRaw = {
  path: '/redirect',
  name: 'redirectWrapper',
  component: Layout,
  props: true,
  meta: {
    requiresAuth: true,
    keepAlive: false,
    permissions: ['*'],
  },
  children: [
    {
      path: '/redirect/:path',
      name: REDIRECT_ROUTE_NAME,
      component: () => import('@/views/redirect/index.tsx'),
      meta: {
        requiresAuth: true,
        keepAlive: false,
        permissions: ['*'],
      }
    }
  ]
}
