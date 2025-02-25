import { computed, defineComponent, h, ref, resolveComponent, resolveDynamicComponent } from 'vue'
import { useAppStore } from '../../store'
import style from './index.module.scss'
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import useMenuTree from './menu-tree'
import { openWindow, regexUrl } from '../../utils'
import { listenerRouteChange } from '@/utils/routeListener'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const router = useRouter()
  const collapsed = computed({
    set(value: boolean) {
      appStore.updateAppSetting({ menuCollapse: value })
    },
    get() {
      return appStore.menuCollapse
    }
  })
  const { menuTree } = useMenuTree()
  const openKeys = ref<string[]>([])
  const selectedKey = ref<string[]>([])
  const topMenu = computed(() => appStore.topMenu && !appStore.hideMenu)
  const setCollapse = (val: boolean) => {
    appStore.updateAppSetting({ menuCollapse: val })
  }
  
  const renderSubMenu = () => {
    function travel(_route: RouteRecordRaw[], nodes = []) {
      if (_route) {
        _route.forEach((el, index) => {
          // const icon = el?.meta?.icon ? h(compile(`<${el?.meta?.icon}/>`)) : null
          const icon = el?.meta?.icon ? h(resolveComponent(el?.meta?.icon)) : null
          const node = el?.children && el?.children?.length !== 0 ?
          (
            <a-sub-menu key={el?.name} v-slots={{icon: () => icon, title: () => t(el?.meta?.title ?? '')}}>
              {travel(el?.children)}
            </a-sub-menu>
          ) : 
          (
            <a-menu-item key={el?.name} v-slots={{icon}} onClick={() => goto(el)}>
              <span>{t(el?.meta?.title ?? '')}</span>
            </a-menu-item>
          )
          
          nodes.push(node as never)
        })
      }
      return nodes
    }
    return travel(menuTree.value)
  }

  const findMenuOpenKeys = (key: string): string[] => {
    const result: string[] = []
    let isOpen = false
    const backtrack = (item: RouteRecordRaw, keys: string[]) => {
      if (item.name === key) {
        isOpen = true
        result.push(...keys)
        return
      }
      if (item?.children?.length) {
        item.children.forEach(el => {
          backtrack(el, [...keys, el.name as string])
        })
      }
    }
    menuTree.value.forEach((item: RouteRecordRaw) => {
      if (isOpen) {
        return
      }
      backtrack(item, [item.name as string])
    })
    return result
  }

  listenerRouteChange((route: RouteLocationNormalized) => {
    const { requiresAuth } = route.meta
    if (requiresAuth) {
      const menuOpenKeys = findMenuOpenKeys(route.name as string)
      const set = new Set([...menuOpenKeys, ...openKeys.value])
      openKeys.value = [...set]
      selectedKey.value = [menuOpenKeys[menuOpenKeys.length - 1]]
    }
  }, true)
  
  const goto = (item: RouteRecordRaw) => {
    if (regexUrl.test(item.path)) {
      openWindow(item.path)
      selectedKey.value = [item.name as string]
      return
    }
    router.push({
      name: item.name,
    })
  }

  return () => (
    <>
      <a-menu
        mode={topMenu.value ? 'horizontal' : 'vertical'}
        v-model:collapsed={collapsed.value}
        v-model:open-keys={openKeys.value}
        selected-keys={selectedKey.value}
        show-collapse-button={!appStore.hideMenu}
        style="height: 100%;width:100%;"
        level-indent={20}
        auto-open={false}
        auto-open-selected={true}
        onCollapse={setCollapse}
      >
        {renderSubMenu()}
      </a-menu>
    </>
  )
})