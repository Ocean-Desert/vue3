import { AppRouteRecordRaw } from '../type'
import { Layout } from '../base'
import { useI18n } from 'vue-i18n'

const USER: AppRouteRecordRaw = {
  path: '/user',
  name: 'profile',
  component: Layout,
  meta: {
    sort: 0,
    requiresAuth: false,
    keepAlive: false,
    permissions: ['*'],
  },
  children: [
    {
      path: 'profile',
      name: 'userProfile',
      component: () => import('@/views/user/index.tsx'),
      meta: {
        title: 'global.setting.userProfile',
        keepAlive: false,
        hideInMenu: true,
        noAffix: false,
        requiresAuth: false, // 是否需要登录鉴权
        permissions: ['*'],
        // icon：菜单配置icon
        // locale：一级菜单名（语言包键名）
        // hideInMenu：是否在左侧菜单中隐藏该项
        // hideChildrenInMenu：强制在左侧菜单中显示单项
        // activeMenu：高亮设置的菜单项
        // order：排序路由菜单项。如果设置该值，值越高，越靠前
        // noAffix：如果设置为true，标签将不会添加到tab-bar中
        // ignoreCache：如果设置为true页面将不会被缓存
      },
    }
  ]
}


export default USER