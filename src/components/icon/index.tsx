import { defineComponent, h, resolveComponent } from 'vue'

export interface IconProps {
  icon: any,
  size?: number | string,
  fill?: string | string[]
}

export default defineComponent((props: IconProps) => {
  const { icon, size, fill } = props
  return () => (
    <>
      {h(resolveComponent(icon), { size, fill })}
    </>
  )
}, {
  props: ['icon', 'size', 'fill']
})