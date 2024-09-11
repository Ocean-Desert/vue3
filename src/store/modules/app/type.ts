
import { SysMenu } from '@/api/system/menus/type'

export interface AppState {
  globalSettings: boolean // 全局配置
  navbar: boolean // 是否渲染头部
  tabBar: boolean // 是否渲染导航栏
  colorWeak: boolean // 色弱模式
  size: Size // 尺寸大小
  menu: boolean // 是否渲染菜单
  hideMenu: boolean // 是否隐藏菜单
  topMenu: boolean // 是否置顶菜单
  routeReady: boolean // 是否路由是否加载完毕
  menuFromServer: boolean // 菜单是否来自服务器
  menuWidth: number // 菜单宽度
  userMenus: SysMenu[] // 用户所分配的菜单
  menuCollapse: boolean // 菜单收缩
  hideSearch: boolean // 是否隐藏搜索栏
  search: boolean // 是否渲染搜索栏
  theme: Theme // 主题
  publicKey: string // 服务器公钥
  security: {
    publicKey: string
    privateKey: string
  } // 本地的钥匙对
}

type Theme = 'dark' | 'light'
type Size = 'mini' | 'small' | 'medium' | 'large'