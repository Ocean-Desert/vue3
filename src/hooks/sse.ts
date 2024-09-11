import { onMounted, onUnmounted, ref } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { getToken } from '@/utils/auth'
import useLocale from '@/hooks/locale'
import { AxiosHeaderValue, HeadersDefaults } from 'axios'

export interface SSEParams {
  url: string // url
  onmessage: (event: MessageEvent) => void // 处理消息的函数
  onopen: () => void // 建立连接触发的事件
  finallyHandler?: () => void // finally，不管出现异常或者关闭必然会执行的代码块
}

export interface SSEOptions {
  init: boolean
  destory: boolean
  headers: HeadersInit
}

export const useSseService = (params: SSEParams, options: SSEOptions = { init: true, destory: true, headers: {} }) => {
  const isConnected = ref(false)
  const authorization = getToken()
  const { currentLocale } = useLocale()
  if (!authorization) {
    console.error('authorization is null')
    return
  }
  const eventSource = new EventSourcePolyfill(params.url, {
    headers: {
      Authorization: authorization,
      'Accept-Language': currentLocale.value,
      ...options.headers
    }
  })

  const connect = () => {
    eventSource.onopen = params.onopen
    eventSource.onmessage = params.onmessage
    eventSource.onerror = error => {
      if (eventSource?.readyState === EventSource.CLOSED) {
        console.warn('SSE connection closed')
      } else {
        console.error(error)
      }
      params.finallyHandler && params.finallyHandler()
      isConnected.value = false
    }
    isConnected.value = true
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      console.log('SSE connection closed')
      params.finallyHandler && params.finallyHandler()
      isConnected.value = false
    }
  }
  onMounted(() => {
    options?.init && connect()
  })
  onUnmounted(() => {
    options?.destory && disconnect()
  })
  return { connect, disconnect, isConnected }
}