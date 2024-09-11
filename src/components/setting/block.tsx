import { computed, defineComponent, PropType } from 'vue'
import style from './index.module.scss'
import { useAppStore } from '@/store'
import { AppState } from '@/store/modules/app/type'
import { SelectInstance } from '@arco-design/web-vue'

export interface OptionsProps {
  name: string
  key: keyof AppState
  type?: Type
  options?: SelectInstance['$props']['options']
  defaultValue?: string | number | boolean
}

type Type = 'number' | 'switch' | 'select'

interface Props {
  title: string
  options?: OptionsProps[]
}

export default defineComponent((props: Props) => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const handleChange = (key: keyof AppState, value: unknown) => {
    if (key === 'colorWeak') {
      document.body.style.filter = value ? 'invert(80%)' : 'none'
    }
    if (key === 'topMenu') {
      appStore.updateAppSetting({ menuCollapse: false })
    }
    appStore.updateAppSetting({ [key]: value })
  }
  return () => (
    <>
      <div class={style.block}>
        <div class={style.title}>{props.title}</div>
        {
          props.options?.map((item, index) => (
            <div class={style.switchWrapper} key={index}>
              <span>{item.name}</span>
              {
                item.type === 'number' ? 
                  <a-input-number style="width: 80px;" size={size.value} defaultValue={item.defaultValue} onChange={(value: unknown) => handleChange(item.key, value)}></a-input-number> :
                item.type === 'select' ? 
                  <a-select style="width: 100px;" size={size.value} defaultValue={item.defaultValue} options={item.options} onChange={(value: unknown) => handleChange(item.key, value)}></a-select> :
                  <a-switch size={size.value} defaultChecked={item.defaultValue} onChange={(value: unknown) => handleChange(item.key, value)}></a-switch>
              }
            </div>
          ))
        }
      </div>
    </>
  )
}, {
  props: {
    title: {
      type: String
    },
    options: {
      type: Array as PropType<OptionsProps[]>,
      default: () => []
    }
  }
})