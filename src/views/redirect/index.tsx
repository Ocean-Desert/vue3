import { defineComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent(() => {
  const router = useRouter()
  const route = useRoute()
  const gotoPath = route.params.path as string
  router.replace({ path: gotoPath })
  return () => null
})