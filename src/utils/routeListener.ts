import type { RouteLocationNormalized } from 'vue-router'
import mitt from 'mitt'
import type { Handler } from 'mitt'

const emitter = mitt()

const key = Symbol('ROUTE_CHANGE')

let lateRoute: RouteLocationNormalized

export const setRouteEmitter = (router: RouteLocationNormalized) => {
  emitter.emit(key, router)
  lateRoute = router
}

export const listenerRouteChange = (handler: (route: RouteLocationNormalized) => void, immediate = true) => {
  emitter.on(key, handler as Handler)
  if (immediate && lateRoute) {
    handler(lateRoute)
  }
}

export const removeRouteListener = () => {
  emitter.off(key)
}
