import { useUserStore } from "@/store"
import { Message } from "@arco-design/web-vue"
import { useRouter } from "vue-router"
import { clearToken } from '@/utils/auth'
import {AuthName} from "@/router/constant";

export default () => {
  const router = useRouter()
  const userStore = useUserStore()
  const logout = async (logoutTo?: string) => {
    await userStore.logout()
    const currentRoute = router.currentRoute.value
    Message.success('登出成功')
    
    router.push({
      name: logoutTo && typeof logoutTo === 'string' ? logoutTo : AuthName,
      query: {
        ...router.currentRoute.value.query,
        redirect: currentRoute.name as string
      },
    })
  }
  return {
    logout
  }
}