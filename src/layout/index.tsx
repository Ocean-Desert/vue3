import { ref, defineComponent, provide, watch, onMounted, computed } from 'vue'
import PageView from './view'
import style from './index.module.scss'
import LayoutHeader from '@/components/header'
import LayoutMenu from '@/components/menu/index'
import Breadcrumb from '@/components/breadcrumb/index'
import TabBar from '@/components/tabBar/index'
import { useAppStore, useUserStore } from '../store/index.js'
import usePermission from '@/hooks/permission.js'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NOT_FOUND } from '@/router/constant.js'

export default defineComponent(() => {
  const appStore = useAppStore()
  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const permission = usePermission()
  const isInit = ref(false)
  const drawerVisible = ref(false)
  const headerHeight = '60px'
  const size = computed(() => { return appStore.size })
  const collapsed = computed(() => { return appStore.menuCollapse })
  const renderHead = computed(() => { return appStore.navbar })
  const renderMenu = computed(() => { return appStore.menu && !appStore.topMenu })
  const menuWidth = computed(() => { return appStore.menuCollapse ? 48 : appStore.menuWidth })
  const hideMenu = computed(() => { return appStore.hideMenu })
  const setCollapse = (val: boolean) => {
    if (!isInit.value) {
      return
    }
    appStore.updateAppSetting({ menuCollapse: val })
  }
  const paddingStyle = computed(() => {
    const paddingLeft = renderMenu.value && !hideMenu.value ? { paddingLeft: `${menuWidth.value}px` } : {}
    const paddingTop = renderHead.value ? { paddingTop: headerHeight } : {}
    return { ...paddingLeft, ...paddingTop }
  })
  const drawerCancel = () => {
    drawerVisible.value = false
  }
  provide('toggleDrawerMenu', () => {
    drawerVisible.value = !drawerVisible.value
  })
  onMounted(() => {
    isInit.value = true
  })
  watch(() => userStore.roles, value => {
    if (value?.length && !permission.accessRouter(route)) {
      router.push(NOT_FOUND)
    }
  })
  return () => (
    <>
      <a-layout class={style.layout}>
        {renderHead.value &&
          <div class={style.layoutHeader}>
            <LayoutHeader />
          </div>
        }
        <a-layout>
          <a-layout>
            {renderMenu.value &&
              <a-layout-sider
                onCollapse={setCollapse}
                collapsed={collapsed}
                collapsible={true}
                hide-trigger={true}
                width={menuWidth.value}
                style={{ paddingTop: renderHead.value ? '60px' : '', display: hideMenu.value ? 'none' : 'block' }}
                class={style.layoutSider}
                breakpoint="xl"
              >
                <div class={style.menuWrapper}>
                  <LayoutMenu />
                </div>
              </a-layout-sider>
            }
            {hideMenu.value &&
              <a-drawer
                title={t('global.menu.title')}
                visible={drawerVisible.value}
                footer={false}
                closable={false}
                mask-closable={true}
                placement="left"
                onCancel={drawerCancel}
                okButtonProps={{ size: size.value }}
                cancelButtonProps={{ size: size.value }}
              >
                <LayoutMenu />
              </a-drawer>
            }
            <a-layout class={style.layoutContent} style={paddingStyle.value}>
              {appStore.tabBar &&
                <TabBar />
              }
              <a-layout-content>
                <div class={style.container}>
                  <Breadcrumb />
                  <div class={style.mainContainer}>
                    <PageView />
                  </div>
                </div>
              </a-layout-content>
            </a-layout>
          </a-layout>
        </a-layout>
      </a-layout>
    </>
  )
})