import { useUserStore } from '@/store'
import { isArray } from '@/utils/is'
import { DirectiveBinding } from 'vue'

const checkRole = (el: HTMLElement, binding: DirectiveBinding) => {
  const { value } = binding
  const userStore = useUserStore()
  const { roles } = userStore
  if (value && isArray(value) && value?.length > 0) {
    const roleValues = value as string[]
    const hasAllRole = roleValues.includes('*')
    const hasRole = roleValues.some(item => roles.includes(item))
    if (!hasAllRole && !hasRole && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`need roles! Like v-role="['admin','user']"`)
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkRole(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkRole(el, binding)
  }
}