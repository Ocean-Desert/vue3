import { onMounted, onUnmounted, ref } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { getToken } from '@/utils/auth'
import useLocale from '@/hooks/locale'
import { AxiosHeaderValue, HeadersDefaults } from 'axios'
import pako from 'pako'

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
  retryTimes: number  // 移除可选标记
  retryInterval: number
  heartbeatTimeout: number  // 移除可选标记
}

const decompressData = (base64Str: string): string => {
  try {
    const binary = atob(base64Str)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decompressed = pako.inflate(bytes, { to: 'string' })
    return decompressed
  } catch (e) {
    console.error('解压失败:', e)
    return base64Str
  }
}

export const useSseService = (params: SSEParams, options: Partial<SSEOptions> = {}) => {
  // 使用默认值合并
  const mergedOptions: SSEOptions = {
    init: true,
    destory: true,
    headers: {},
    retryTimes: 3,
    retryInterval: 3000,
    heartbeatTimeout: 35000,
    ...options  // 合并用户传入的配置
  }

  const isConnected = ref(false)
  const retryCount = ref(0)
  let retryTimer: NodeJS.Timeout | null = null
  let heartbeatTimer: NodeJS.Timeout | null = null
  let lastHeartbeatTime = 0
  let eventSource: EventSourcePolyfill | null = null
  const { currentLocale } = useLocale()

  const checkHeartbeat = () => {
    const now = Date.now()
    if (now - lastHeartbeatTime > mergedOptions.heartbeatTimeout) {  // 使用合并后的配置
      console.warn('Heartbeat timeout, reconnecting...')
      disconnect()
      connect()
    }
  }

  const startHeartbeatCheck = () => {
    heartbeatTimer = setInterval(checkHeartbeat, 5000) // 每5秒检查一次心跳
  }

  const connect = () => {
    eventSource = new EventSourcePolyfill(params.url, {
      headers: {
        Authorization: getToken() || '',
        'Accept-Language': currentLocale.value,
        ...mergedOptions.headers
      }
    })

    eventSource.onopen = () => {
      retryCount.value = 0
      lastHeartbeatTime = Date.now()
      startHeartbeatCheck()
      params.onopen()
    }

    eventSource.onmessage = (event) => {
      if (event.data === 'heartbeat') {
        lastHeartbeatTime = Date.now()
        return
      }

      // 处理压缩数据
      if (event.lastEventId === 'compressed') {
        const decompressed = decompressData(event.data)
        params.onmessage(new MessageEvent('message', { data: decompressed }))
      } else {
        params.onmessage(event)
      }
    }

    eventSource.onerror = error => {
      if (eventSource?.readyState === EventSource.CLOSED) {
        console.warn('SSE connection closed')
        if (error instanceof Error && error.message.includes('403')) {
          console.error('Authentication failed')
          disconnect()
          return
        }
        
        if (mergedOptions.retryTimes && retryCount.value < mergedOptions.retryTimes) {
          retryCount.value++
          console.log(`Retrying connection (${retryCount.value}/${mergedOptions.retryTimes})...`)
          retryTimer = setTimeout(() => {
            disconnect()
            connect()
          }, mergedOptions.retryInterval)
        } else {
          console.error('Max retry attempts reached')
          params.finallyHandler?.()
        }
      } else {
        console.error(error)
      }
      isConnected.value = false
    }

    isConnected.value = true
  }

  const disconnect = () => {
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (eventSource) {
      eventSource.close()
      eventSource = null
      console.log('SSE connection closed')
      params.finallyHandler?.()
      isConnected.value = false
    }
  }

  const cleanup = () => {
    disconnect()
    retryCount.value = 0
  }

  onMounted(() => {
    mergedOptions?.init && connect()
  })

  onUnmounted(() => {
    mergedOptions?.destory && cleanup()
  })

  return { 
    connect, 
    disconnect, 
    isConnected,
    retryCount,
    cleanup
  }
}