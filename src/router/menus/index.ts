import { RouteRecordRaw } from 'vue-router'
import { appRoutes } from '../routes'

const mixinRoutes: RouteRecordRaw[] = [...appRoutes]

const appClientMenus: RouteRecordRaw[] = mixinRoutes.map((data) => {
  const { name, path, meta, redirect, children = [], component } = data
  return {
    name,
    path,
    meta,
    redirect,
    children,
    component,
  }
})

export default appClientMenus