import { useAppStore } from '@/store'
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

export const useViewSize = () => {
  const appStore = useAppStore()
  const { width, height } = useWindowSize()

  const viewHeight = computed(() => {
    return height.value - (appStore.navbar ? 60 : 0) - (appStore.tabBar ? 33 : 0) - 20 - 56
  })

  const viewWidth = computed(() => {
    return width.value - (appStore.menuCollapse ? 48 : appStore.menuWidth) - 40
  })
  return { viewHeight, viewWidth }
}