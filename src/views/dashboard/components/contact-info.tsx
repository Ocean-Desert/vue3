import { defineComponent } from 'vue'
import style from '../index.module.scss'
import { getAssetsFile, openWindow } from '@/utils'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const { t } = useI18n()
  const openUrl = (url: string) => {
    openWindow(url)
  }
  return () => (
    <>
      <a-card title={t('components.contact-info.775748-0')} hoverable>
        <a-typography-paragraph type={'secondary'}>
          <ul class={style.list}>
            <li class={style.contactItem}>
              <icon-wechat />
              <a-typography-paragraph style="margin-bottom: 0;" copyable underline>wx43715502</a-typography-paragraph>
            </li>
            <li class={style.contactItem}>
              <icon-qq />
              <a-typography-paragraph style="margin-bottom: 0;" copyable underline>2654985922</a-typography-paragraph>
              <a-typography-paragraph style="margin-bottom: 0;" copyable underline>43715502</a-typography-paragraph>
            </li>
            <li class={style.contactItem}>
              <icon-email />
              <a-typography-paragraph style="margin-bottom: 0;" copyable underline>2654985922@qq.com</a-typography-paragraph>
            </li>
            <li class={style.contactItem}>
              <icon-tiktok-color />
              <a-typography-paragraph style="margin-bottom: 0;" copyable underline>28849450016</a-typography-paragraph>
            </li>
            <li class={style.contactItem}>
              <icon-github />
              <a-typography-paragraph style="margin-bottom: 0;cursor: pointer;" onClick={() => openUrl('https://github.com/Ocean-Desert')} underline>{t('components.donate-info.733724-2')}</a-typography-paragraph>
            </li>
          </ul>
        </a-typography-paragraph>
      </a-card>
    </>
  )
})