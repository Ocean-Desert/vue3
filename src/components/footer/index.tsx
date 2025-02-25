import { defineComponent, computed } from 'vue'
import { useAppStore } from '@/store'
import { openWindow } from '@/utils'
import style from './index.module.scss'

export default defineComponent(() => {
  const appStore = useAppStore()
  const theme = computed(() => appStore.theme)

  const handleClick = () => {
    openWindow('https://beian.miit.gov.cn/', { target: '_blank' })
  }

  return () => (
    <div 
      class={style.footer}
      style={{
        background: theme.value === 'light' 
          ? 'var(--color-bg-2)' 
          : 'var(--color-bg-1)'
      }}
    >
      <div class={style.footerContent}>
        <div class={style.links}>
          <span 
            class={style.beianLink} 
            onClick={handleClick}
          >
            粤ICP备2024341340号
          </span>
        </div>
        {/* <div class={style.copyright}>
          Copyright © 2024 All Rights Reserved
        </div> */}
      </div>
    </div>
  )
}) 