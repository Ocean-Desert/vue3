import { NOT_FOUND } from '@/router/constant'
import { useAppStore } from '@/store'
import { defineComponent, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import style from './index.module.scss'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const router = useRouter()
  const appStore = useAppStore()
    const { t } = useI18n()
  // watchEffect(() => {
  //   if (appStore.getRouteReady) {
  //     const routerList = router.getRoutes()
  //     debugger
  //     if (routerList.find(item => item.path === router.currentRoute.value.fullPath)) {
  //       router.push(router.currentRoute.value.fullPath)
  //     } else {
  //       router.push(NOT_FOUND)
  //     }
  //   }
  // })
  watchEffect(() => {
    if (appStore.getRouteReady) {
      const resolvedRoute = router.resolve(router.currentRoute.value.fullPath)
      if (resolvedRoute.matched.length > 1) {
        router.push(router.currentRoute.value.fullPath)
      } else {
        router.push(NOT_FOUND)
      }
    }
  })
  return () => (
    <>
      <div class={style.load}>
        <a-spin dot tip={t('global.load')} size={25} />
      </div>
    </>
  )
})