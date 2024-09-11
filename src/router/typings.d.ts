import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    id?: number
    title?: string
    type?: string
    sort?: number
    icon?: string
    noAffix?: boolean
    keepAlive?: boolean
    requiresAuth?: boolean
    permissions?: Array<string>
  }
}
