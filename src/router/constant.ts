export const REDIRECT_ROUTE_NAME = 'redirect'

export const LayoutName = 'layout'
export const LoadName = 'load'
export const AuthName = 'auth'
export const NotFoundName = 'notFound'

export const WHITE_LIST = [
  { name: NotFoundName, children: [] },
  { name: AuthName, children: [] },
  { name: LoadName, children: [] },
]
// LoginName
export const INTERNAL = [
  { name: 'profile', children: [] },
  { name: 'userProfile', children: [] },
]

export const BASE = [
  { name: 'redirectWrapper', children: [] },
  { name: REDIRECT_ROUTE_NAME, children: [] },
  { name: LayoutName, children: [] },
]

export const DEFAULT_ROUTE = {
  title: 'global.menu.dashboard',
  name: 'dashboard',
  fullPath: '/dashboard',
}

export const NOT_FOUND = {
  name: 'notFound',
}