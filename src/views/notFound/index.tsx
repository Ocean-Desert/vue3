import { computed, defineComponent } from 'vue'
import style from './index.module.scss'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent({
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const appStore = useAppStore()
    const size = computed(() => appStore.size)
    const retry = () => {
      router.go(-1)
    }
    const goBack = () => {
      router.go(-2)
    }
    return () => (
      <>
        <div class={style.content}>
          <a-result class="result" status="404" subtitle={t('views.notFound.title')}></a-result>
          <div class="operation-row">
            <a-button key="again" onClick={retry} style="margin-right: 16px" size={size.value}>{t('views.notFound.retry')}</a-button>
            <a-button key="back" onClick={goBack} type="primary" size={size.value}>{t('views.notFound.back')}</a-button>
          </div>
        </div>
      </>
    )
  }
})