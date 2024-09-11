import { computed, defineComponent, ref, watch } from 'vue'
import style from './index.module.scss'
import { useAppStore } from '@/store'
import { listenerRouteChange } from '@/utils/routeListener'
import { RouteLocationNormalized } from 'vue-router'
import useTabBarStore from '@/store/modules/tabBar'
import TabItem from './tabItem'

export default defineComponent(() => {
  const affixRef = ref()
  const appStore = useAppStore()
  const tabBarStore = useTabBarStore()
  const tagList = computed(() => {
    return tabBarStore.getTagList
  })
  const offsetTop = computed(() => {
    return appStore.tabBar ? 60 : 0
  })
  watch(() => appStore.navbar, () => {
    affixRef.value.updatePosition()
  })
  listenerRouteChange((route: RouteLocationNormalized) => {
    if (!route.meta.noAffix && !tagList.value.some(item => item.fullPath === route.fullPath)) {
      tabBarStore.updateTabList(route)
    }
  }, true)
  return () => (
    <>
      <div class={style.tabBarContainer}>
        <a-affix ref={affixRef} offset-top={offsetTop}>
          <div class={style.tabBarBox}>
            <div class={style.tabBarScroll}>
              <div class={style.tagsWrap}>
                {
                  tagList.value.map((item, index) => {
                    return <TabItem key={item.fullPath} index={index} data={item} />
                  })
                }
              </div>
            </div>
          </div>
          <div class={style.tagBarOperation}></div>
        </a-affix>
      </div>
    </>
  )
})