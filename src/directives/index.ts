import { App } from 'vue'
import permission from './permission'
import role from './role'

export default {
  install(Vue: App) {
    Vue.directive('permission', permission).directive('role', role)
  }
}