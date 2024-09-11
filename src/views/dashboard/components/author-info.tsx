import { computed, defineComponent, ref } from 'vue'
import style from '../index.module.scss'
import { getAssetsFile, openWindow } from '@/utils'
import { useI18n } from 'vue-i18n'
import { DescData } from '@arco-design/web-vue'

export default defineComponent(() => {
  const { t } = useI18n()
  const userInfo = computed<DescData[]>(() => ([
    {
      label: t('components.author-info.805275-0'),
      value: t('components.author-info.805275-1'),
    }, {
      label: t('components.author-info.805275-2'),
      value: '23',
    }, {
      label: t('components.author-info.805275-3'),
      value: t('components.author-info.805275-4')
    }, {
      label: t('components.author-info.805275-5'),
      value: t('components.author-info.805275-6'),
    }, {
      label: t('components.author-info.805275-7'),
      value: `${t('components.author-info.805275-8')}(bushi)${t('components.author-info.805275-9')}`
    }
  ]))
  return () => (
    <>
      <a-card title={t('components.author-info.805275-10')} hoverable>
        <a-row gutter={{ xs: 4, sm: 6, md: 12 }}>
          <a-col span={10}>
            <a-image width="100%" src={getAssetsFile('avatar.jpg')} />
          </a-col>
          <a-col span={14}>
            <a-descriptions data={userInfo.value} size={'mini'} column={1} />
          </a-col>
        </a-row>
      </a-card>
    </>
  )
})