import { RouteRecordRaw } from 'vue-router'
import { LoadName, LoginName, NotFoundName, REDIRECT_ROUTE_NAME } from './constant'
import { Layout } from './routes/base'

export const STATIC: RouteRecordRaw[] = [
  {
    path: '/login',
    name: LoginName,
    component: () => import('@/views/login/index.tsx'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/notFound',
    name: NotFoundName,
    component: () => import('@/views/notFound/index.tsx'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: LoadName,
    component: () => import('@/layout/load.tsx'),
  }
]

export const DYNAMIC_ROUTES: RouteRecordRaw[] = [
  {
    name: 'dictData',
    path: '/system/dict-data',
    component: Layout,
    meta: {
      title: '字典数据',
      requiresAuth: true,
      permissions: ['system:dict:list'],
      keepAlive: false,
    },
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data.tsx'),
        name: 'dictDataIndex',
        meta: {
          title: '字典数据',
          requiresAuth: true,
          permissions: ['system:dict:list'],
          keepAlive: false,
        }
      }
    ]
  },
]
