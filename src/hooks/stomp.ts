import { getToken } from '@/utils/auth'
// import SockJS from 'sockjs-client'
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import Stomp, { Frame } from 'stompjs'
import { Ref, onBeforeMount, onBeforeUnmount, ref, toRefs } from 'vue'

export interface StompOptions {
  init: boolean
  destory: boolean
  headers: HeadersInit
  socketEndpoint: string // 连接路径
  connectCallback?: (frame?: Frame) => any // 建立连接触发的事件
  finallyHandler?: (frame?: Frame | string) => any // finally，不管出现异常或者关闭必然会执行的代码块
}

export interface StompResult {
  connect: () => void
  disconnect: () => void
  isConnected: Ref<boolean>
  stompClient: Ref<Stomp.Client | undefined>
  subscribe: (destination: string, callback: (message: Stomp.Message) => void) => void
}

export const useStomp = (options: StompOptions = { init: true, destory: true, headers: {}, socketEndpoint: import.meta.env.VITE_API_CONTEXT_PATH + '/ws' }): StompResult => {
  const authorization = getToken()
  const isConnected = ref(false)
  const stompClient = ref<Stomp.Client | undefined>()
  if (!authorization) {
    console.error('authorization is null')
  }
  const connect = () => {
    const socket = new SockJS(options.socketEndpoint)
    const client = Stomp.over(socket)
    client.connect(
      { Authorization: authorization, ...options.headers },
      (frame?: Frame) => {
        isConnected.value = true
        stompClient.value = client
        options.connectCallback && options.connectCallback(frame)
      },
      (err: Frame | string) => {
        isConnected.value = false
        console.error(err)
        options.finallyHandler && options.finallyHandler(err)
      }
    )
  }

  const disconnect = () => {
    if (stompClient.value && stompClient.value.connected) {
      stompClient.value.disconnect(() => {
        isConnected.value = false
        stompClient.value = undefined
        console.log('stomp connection closed')
        options.finallyHandler && options.finallyHandler()
      })
    }
  }

  const subscribe = (destination: string, callback: (message: Stomp.Message) => void) => {
    if (stompClient.value) {
      stompClient.value.subscribe(destination, callback);
    }
  }
  onBeforeMount(() => {
    options?.init && connect()
  })
  onBeforeUnmount(() => {
    options?.destory && disconnect()
  })

  return { connect, disconnect, isConnected, stompClient, subscribe }
}