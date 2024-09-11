import { isArray } from '@/utils/is'
import type { RouteRecordNormalized } from 'vue-router'

const modules = import.meta.glob('./modules/*.ts', { eager: true })

const internalModules = import.meta.glob('./internalModules/*.ts', { eager: true })

const formatModules = (_modules: any, result: RouteRecordNormalized[]) => {
  Object.keys(_modules).forEach(key => {
    const defaultModule = _modules[key].default
    if (!defaultModule) return
    const moduleList = isArray(defaultModule) ? [...defaultModule] : [defaultModule]
    result.push(...moduleList)
  })
  return result
}

export const appRoutes: RouteRecordNormalized[] = formatModules(modules, [])

export const internalRoutes: RouteRecordNormalized[] = formatModules(internalModules, [])
