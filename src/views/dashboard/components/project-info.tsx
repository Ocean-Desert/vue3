import { defineComponent } from 'vue'
import style from '../index.module.scss'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const { t } = useI18n()
  return () => (
    <>
      <a-row gutter={{ xs: 8, sm: 12, md: 24 }}>
        <a-col span={12}>
          <a-typography>
            <a-typography-title heading={4} type={'secondary'}>{t('components.project-info.586179-0')}</a-typography-title>
            <a-typography-paragraph type={'secondary'}>
              {t('components.project-info.586179-1')}
              {t('components.project-info.586179-2')}
              {t('components.project-info.586179-3')}
              {t('components.project-info.586179-4')}
            </a-typography-paragraph>
          </a-typography>
        </a-col>
        <a-col span={12}>
          <a-typography-title heading={4} type={'secondary'}>{t('components.project-info.586179-5')}</a-typography-title>
          <a-row>
            <a-col span={6}>
              <a-typography-paragraph style="margin-bottom: 5px;" type={'secondary'}>{t('components.project-info.586179-6')}</a-typography-paragraph>
              <a-typography-paragraph type={'secondary'}>
                <ul class={style.list}>
                  <li>Vue3</li>
                  <li>Vite</li>
                  <li>Arco Design Vue</li>
                  <li>Axios</li>
                  <li>Pinia</li>
                </ul>
              </a-typography-paragraph>
            </a-col>
            <a-col span={6}>
              <a-typography-paragraph style="margin-bottom: 5px;" type={'secondary'}>{t('components.project-info.586179-7')}</a-typography-paragraph>
              <a-typography-paragraph type={'secondary'}>
                <ul class={style.list}>
                  <li>SpringBoot3</li>
                  <li>SpringSecurity6</li>
                  <li>MybatisFlex</li>
                  <li>Redis</li>
                  <li>RabbitMQ</li>
                </ul>
              </a-typography-paragraph>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </>
  )
})