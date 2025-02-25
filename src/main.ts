import { createApp } from 'vue'
import { nextTick } from '@vue/runtime-core'
import App from './App'
import router from '@/router/index'
import store from './store'
import i18n from './locale'
import { install } from '@icon-park/vue-next/es/all'
import directive from '@/directives/index'
import MessageBox from '@/hooks/message'
import globalComponents from '@/components'

import '@icon-park/vue-next/styles/index.css'
import '@/assets/style/global.scss'

const app = createApp(App)
// IconPark(app)
nextTick(() => {
  app.config.globalProperties.$message = MessageBox
})
install(app)
app.use(router).use(directive).use(store).use(globalComponents).use(i18n).mount('#app')
