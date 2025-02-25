import { defineComponent } from 'vue'
import { openWindow } from '@/utils'
import style from '../index.module.scss'

export default defineComponent(() => {
  const handleClick = () => {
    openWindow('https://beian.miit.gov.cn/', { target: '_blank' })
  }

  return () => (
    <div class={style.footer}>
      <span 
        class={style.beianLink} 
        onClick={handleClick}
      >
        粤ICP备2024341340号
      </span>
    </div>
  )
}) 