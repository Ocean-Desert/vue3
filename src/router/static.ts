import { RouteRecordRaw } from 'vue-router'
import { LoadName, AuthName, NotFoundName, REDIRECT_ROUTE_NAME } from './constant'
import { Layout } from './routes/base'

export const STATIC: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: AuthName,
    component: () => import('@/views/auth/index.tsx'),
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
  }, {
    name: 'genEdit',
    path: '/tool/gen-edit',
    component: Layout,
    meta: {
      title: '生成配置',
      requiresAuth: true,
      permissions: ['tool:generator:edit'],
      keepAlive: false,
    },
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/edit.tsx'),
        name: 'genEditIndex',
        meta: {
          title: '生成配置',
          requiresAuth: true,
          permissions: ['tool:generator:edit'],
          keepAlive: false,
        }
      }
    ]
  }

]
