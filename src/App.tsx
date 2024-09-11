import { computed, defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import Settings from '@/components/setting/index'
import useLocale from '@/hooks/locale'
import enUS from '@arco-design/web-vue/es/locale/lang/en-us'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'

export default defineComponent(() => { 
  const { currentLocale } = useLocale()
  const locale = computed(() => {
    switch (currentLocale.value) {
      case 'zh-CN':
        return zhCN
      case 'en-US':
        return enUS
      default:
        return zhCN
    }
  })

  return () => (
      <>
        <a-config-provider locale={locale.value}>
          <RouterView />
          <Settings />
        </a-config-provider>
      </>
    )
})
