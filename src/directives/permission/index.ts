import { useUserStore } from '@/store'
import { isArray } from '@/utils/is'
import { DirectiveBinding } from 'vue'

const checkPermission = (el: HTMLElement, binding: DirectiveBinding) => {
  const { value } = binding
  const userStore = useUserStore()
  const { permissions } = userStore
  if (value && isArray(value) && value?.length > 0) {
    const permissionValues = value as string[]
    const hasAllPermission = permissionValues.includes('*')
    const hasPermission = permissionValues.some(item => permissions.includes(item))
    if (!hasAllPermission && !hasPermission && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`need permission! Like v-permission="['admin','user']"`)
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  }
}