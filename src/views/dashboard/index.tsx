import { computed, defineComponent, onMounted, ref } from 'vue'
import style from './index.module.scss'
import { useAppStore } from '@/store'
import ProjectInfo from './components/project-info'
import AuthorInfo from './components/author-info'
import ContactInfo from './components/contact-info'
import DonateInfo from './components/donate-info'

export default defineComponent(() => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  return () => (
    <>
      <div class={style.container}>
        <ProjectInfo />
        <a-divider />
        <a-row gutter={{ xs: 4, sm: 6, md: 12 }}>
          <a-col span={8}>
            <AuthorInfo />
          </a-col>
          <a-col span={8}>
            <ContactInfo />
          </a-col>
          <a-col span={8}>
            <DonateInfo />
          </a-col>
        </a-row>
      </div>
    </>
  )
})