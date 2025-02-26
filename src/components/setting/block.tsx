import { computed, defineComponent, PropType } from 'vue'
import style from './index.module.scss'
import { useAppStore } from '@/store'
import { AppState } from '@/store/modules/app/type'
import { SelectInstance } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { removeRouteListener } from '@/utils/routeListener'
import appClientMenus from '@/router/menus'
import { useTabBarStore } from '@/store'
import { LayoutName, LoadName } from '@/router/constant'
import type { RouteRecordName, RouteRecordRaw } from 'vue-router'
import type { SysMenu } from '@/api/system/menus/type'

export interface OptionsProps {
  name: string
  key: keyof AppState
  type?: Type
  options?: SelectInstance['$props']['options']
  defaultValue?: string | number | boolean
}

type Type = 'number' | 'switch' | 'select'

interface Props {
  title: string
  options?: OptionsProps[]
}

export default defineComponent((props: Props) => {
  const router = useRouter()
  const tabBarStore = useTabBarStore()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)

  const removeRoutes = (routesToBeRemoved: SysMenu[] | RouteRecordRaw[]) => {
    removeRouteListener()
    const routes = router.getRoutes()
    routes.forEach(item => {
      if (routesToBeRemoved.find(route => route.name === item.name)) {
        try {
          const routeName = item.name as NonNullable<RouteRecordName>
          router.removeRoute(routeName)
        } catch (error) {
          console.error(`Failed to remove route: ${String(item.name)}`, error)
        }
      }
    })
  }
  const handleChange = (key: keyof AppState, value: unknown) => {
    switch (key) {
      case 'menuFromServer': {
        if (value) {
          // 来自后台获取菜单
          const routesToBeRemoved = appClientMenus
          removeRoutes(routesToBeRemoved)
        } else {
          // 来自本地菜单
          const routesToBeDel = [...appStore.getMenus]
          appStore.clearUserMenus()
          removeRoutes(routesToBeDel)
          
          // 确保重置后重新加载静态路由
          setTimeout(() => {
            router.push({ 
              name: LoadName,
              query: { redirect: 'dashboard' }
            })
          }, 100)
        }
        // 重置标签栏
        tabBarStore.resetTabList()
        break
      }
      case 'colorWeak': {
        document.body.style.filter = value ? 'invert(80%)' : 'none'
        break
      }
      case 'topMenu': {
        appStore.updateAppSetting({ menuCollapse: false })
        break
      }
    }
    appStore.updateAppSetting({ [key]: value })
  }

  return () => (
    <>
      <div class={style.block}>
        <div class={style.title}>{props.title}</div>
        {
          props.options?.map((item, index) => (
            <div class={style.switchWrapper} key={index}>
              <span>{item.name}</span>
              {
                item.type === 'number' ? 
                  <a-input-number style="width: 80px;" size={size.value} defaultValue={item.defaultValue} onChange={(value: unknown) => handleChange(item.key, value)}></a-input-number> :
                item.type === 'select' ? 
                  <a-select style="width: 100px;" size={size.value} defaultValue={item.defaultValue} options={item.options} onChange={(value: unknown) => handleChange(item.key, value)}></a-select> :
                  <a-switch size={size.value} defaultChecked={item.defaultValue} onChange={(value: unknown) => handleChange(item.key, value)}></a-switch>
              }
            </div>
          ))
        }
      </div>
    </>
  )
}, {
  props: {
    title: {
      type: String
    },
    options: {
      type: Array as PropType<OptionsProps[]>,
      default: () => []
    }
  }
})