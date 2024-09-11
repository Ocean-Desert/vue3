import { EChartsOption } from 'echarts'
import { useAppStore } from '@/store'
import { computed } from 'vue'

interface optionsFn {
  (isDark: boolean): EChartsOption
}

export default (sourceOption: optionsFn) => {
  const appStore = useAppStore()
  const isDark = computed(() => {
    return appStore.theme === 'dark'
  })
  const chartOption = computed<EChartsOption>(() => {
    return sourceOption(isDark.value)
  })
  return { chartOption }
}