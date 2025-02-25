import { useTabBarStore } from '@/store'
import style from './index.module.scss'
import { TagProps } from '@/store/modules/tabBar/type'
import { PropType, computed, defineComponent, withModifiers } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eaction, type TabItemProps } from './type'
import { LayoutName, REDIRECT_ROUTE_NAME } from '@/router/constant'
import { useI18n } from 'vue-i18n'

export default defineComponent((props: TabItemProps) => {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const tabBarStore = useTabBarStore()
  const tagList = computed(() => {
    return tabBarStore.getTagList
  })
  const disabledRight = computed(() => {
    return props.index === tagList.value.length - 1
  })
  const disabledLeft = computed(() => {
    return [0, 1].includes(props.index)
  })
  const disabledCurrent = computed(() => {
    return props.index === 0
  })
  const disabledReload = computed(() => {
    return props.data.fullPath !== route.fullPath
  })
  const actionSelect = async (value: any) => {
    const { data, index } = props
    const copyTagList = [...tagList.value]
    if (value === Eaction.current) {
      tagClose(data, index)
    } else if (value === Eaction.left) {
      const currentRouteIdx = findCurrentRouteIndex()
      copyTagList.splice(1, props.index - 1)
      tabBarStore.freshTabList(copyTagList)
      if (currentRouteIdx < index) {
        router.push({ name: data.name })
      }
    } else if (value === Eaction.right) {
      const currentRouteIdx = findCurrentRouteIndex()
      copyTagList.splice(props.index + 1)
      tabBarStore.freshTabList(copyTagList)
      if (currentRouteIdx > index) {
        router.push({ name: data.name })
      }
    } else if (value === Eaction.others) {
      const filterList = tagList.value.filter((item, idx) => idx === 0 || idx === props.index)
      tabBarStore.freshTabList(filterList)
      router.push({ name: data.name })
    } else if (value === Eaction.reload) {
      tabBarStore.deleteCache(data)
      await router.push({
        name: REDIRECT_ROUTE_NAME,
        params: {
          path: route.fullPath
        }
      })
      tabBarStore.addCache(data.name)
    } else {
      tabBarStore.resetTabList()
      router.push({ name: LayoutName, replace: true })
    }
  }
  const tagClose = (tag: TagProps, index: number) => {
    tabBarStore.deleteTag(index, tag)
    if (props.data.fullPath === route.fullPath) {
      const last = tagList.value[index - 1]
      router.push({ name: last.name })
    }
  }
  const findCurrentRouteIndex = () => {
    return tagList.value.findIndex(item => item.fullPath === route.fullPath)
  }
  const goto = (tag: TagProps) => {
    router.push({ ...tag })
  }
  return () => (
    <>
      <a-dropdown
        trigger="contextMenu"
        popup-max-height={false}
        onSelect={actionSelect}
      >
        {{
          content: () =>
            <>
              <a-doption disabled={disabledReload.value} value={Eaction.reload}>
                <icon-refresh />
                <span>{t('global.setting.tabBar.reload')}</span>
              </a-doption>
              <a-doption class={style.sperateLine} disabled={disabledCurrent.value} value={Eaction.current}>
                <icon-close />
                <span>{t('global.setting.tabBar.current')}</span>
              </a-doption>
              <a-doption disabled={disabledLeft.value} value={Eaction.left}>
                <icon-to-left />
                <span>{t('global.setting.tabBar.left')}</span>
              </a-doption>
              <a-doption class={style.sperateLine} disabled={disabledRight.value} value={Eaction.right}>
                <icon-to-right />
                <span>{t('global.setting.tabBar.right')}</span>
              </a-doption>
              <a-doption value={Eaction.others} >
                <icon-swap />
                <span>{t('global.setting.tabBar.others')}</span>
              </a-doption>
              <a-doption value={Eaction.all}>
                <icon-folder-delete />
                <span>{t('global.setting.tabBar.all')}</span>
              </a-doption>
            </>,
          default: () =>
            <span onClick={withModifiers(() => goto(props.data), [])} class={props.data.fullPath === route.fullPath ?
              ('arco-tag arco-tag-size-medium arco-tag-checked ' + style.linkActivated) :
              'arco-tag arco-tag-size-medium arco-tag-checked'}
            >
              <span class="tagLink">
                {t(props.data.title)}
              </span>
              <span
                class="arco-icon-hover arco-tag-icon-hover arco-icon-hover-size-medium arco-tag-close-btn"
                onClick={withModifiers(() => tagClose(props.data, props.index), ['stop'])}
              >
                <icon-close />
              </span>
            </span>
        }}
      </a-dropdown>
    </>
  )
}, {
  props: {
    index: {
      type: Number,
      default: 0
    },
    data: {
      type: Object as PropType<TagProps>,
      default() {
        return []
      }
    },
  }
})