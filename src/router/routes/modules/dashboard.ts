import { AppRouteRecordRaw } from '../type'

const DASHBOARD: AppRouteRecordRaw = {
  name: 'dashboard',
  path: 'dashboard',
  component: () => import('@/views/dashboard/index'),
  meta: {
    id: 1,
    title: '首页',
    type: 'M',
    sort: 0,
    icon: 'M',
    noAffix: false,
    keepAlive: false,
    permission: ['*'],
    requiresAuth: true,
  }
}

export default DASHBOARD