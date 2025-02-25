import { defineComponent } from 'vue'
import style from '../index.module.scss'
import { getAssetsFile, openWindow } from '@/utils'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const { t } = useI18n()
  return () => (
    <>
      <a-card title={t('components.donate-info.733724-0')} hoverable>
        <a-row gutter={{ xs: 4, sm: 6, md: 12 }}>
          <a-col span={12}>
            {/* <a-image width="100%" src={getAssetsFile('wechatpay.jpg')} /> */}
          </a-col>
          <a-col span={12}>
            {/* <a-image width="100%" src={getAssetsFile('alipay.jpg')} /> */}
          </a-col>
        </a-row>
        <a-typography-paragraph style="margin-top: 16px;">{t('components.donate-info.733724-1')}</a-typography-paragraph>
      </a-card>
    </>
  )
})