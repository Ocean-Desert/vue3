import { computed, defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import Settings from '@/components/setting/index'
import useLocale from '@/hooks/locale'
import enUS from '@arco-design/web-vue/es/locale/lang/en-us'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
import dayjs from 'dayjs'

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
          <a-watermark content={['陈煌管理系统', dayjs().format('YYYY-MM-DD')]} z-index={100}>
            <RouterView />
            <Settings />
          </a-watermark>
        </a-config-provider>
      </>
    )
})
