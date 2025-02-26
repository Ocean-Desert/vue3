import { AppRouteRecordRaw } from '../type'

const TEST: AppRouteRecordRaw = {
  name: 'test',
  path: 'test',
  component: () => import('@/views/test/index.vue'),
  meta: {
    id: 2,
    title: '测试',
    type: 'M',
    sort: 1,
    icon: 'M',
    noAffix: false,
    keepAlive: false,
    permission: ['*'],
    requiresAuth: true,
  }
}

export default TEST