import { defineComponent, ref } from 'vue'
import style from './index.module.scss'
import { RouteLocationNormalized, useRoute } from 'vue-router'
import { listenerRouteChange } from '@/utils/routeListener'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const { t } = useI18n()
  const routers = ref<string[]>([])
  listenerRouteChange((route: RouteLocationNormalized) => {
    const matchedRoutes = route.matched?.slice(1)
    if (matchedRoutes?.length > 0) {
      routers.value = matchedRoutes.map(item => item.meta?.title) as string[]
    } else {
      routers.value = []
    }
  }, true)
  return () => (
    <>
      <a-breadcrumb class={style.containerBreadcrumb}>
        <a-breadcrumb-item>
          <icon-apps />
        </a-breadcrumb-item>
        {
          routers.value.map((item, index) => {
            return <a-breadcrumb-item key={index}>
              <span>{item && t(item)}</span>
            </a-breadcrumb-item>
          })
        }
      </a-breadcrumb>
    </>
  )
})