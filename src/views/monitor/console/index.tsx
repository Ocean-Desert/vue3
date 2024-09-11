import { computed, defineComponent, onBeforeMount, onMounted, ref, watchEffect } from 'vue'
import style from './index.module.scss'
import Stomp, { Client, Frame } from 'stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import { getToken } from '@/utils/auth'
import { loggerList, download } from '@/api/monitor/console'
import { LoggerLevel, LoggerMessage } from '@/api/monitor/console/type'
import { JSX } from 'vue/jsx-runtime/index'
import { useAppStore } from '@/store'
import { downloadFile } from '@/utils/index'
import { isEmpty } from '@/utils/is'
import { useI18n } from 'vue-i18n'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const panelColor = ref('')
  const textColor = ref('')
  const levels = ref<string[]>([])
  const client = ref<Client>()
  const isMouseInside = ref(false)
  const checked = ref(false)
  const panelRef = ref<HTMLElement>()
  const loggerMessage = ref<LoggerMessage[]>([])
  const permission = ['monitor:console:download']
  const onSelect = (value: string[]) => {
    checked.value = value.length === 4
  }
  const onChecked = (value: boolean | (string | number | boolean)[]) => {
    levels.value = value ? ['INFO', 'DEBUG', 'WARN', 'ERROR'] : []
  }
  const onFilterData = () => {
    fetchData()
  }
  const fetchData = async () => {
    const { data } = await loggerList(isEmpty(levels.value) ? '' : '?' + queryString(levels.value))
    loggerMessage.value = data as LoggerMessage[]
  }
  const queryString = (levels: string[]) => {
    return levels.map(level => `levels=${encodeURIComponent(level)}`).join('&')
  }
  const getLevelColor = (level: LoggerLevel): string => {
    switch (level) {
      case 'INFO': return '#067d17'
      case 'WARN': return '#b28c00'
      case 'ERROR': return '#ce0505'
      case 'DEBUG': return '#000000'
    }
  }
  const buildPanel = (logger: LoggerMessage[]) => {
    if (logger) {
      const nodes: JSX.Element[] = []
      for (const item of logger) {
        const node = <p class={style.codeLine}>
          <span>{item.timestamp}</span>
          <span style={{ color: getLevelColor(item.level) }}>{item.level}</span>
          <span>---</span>
          <span>{'[' + item.threadName + ']'}</span>
          <span style={{ color: '#028e8e' }}>{item.className}</span>
          <span>{item.body}</span>
          {item.exception && <div style={{ color: '#ce0505', marginTop: '1em' }} v-html={item.exception}></div>}
        </p>
        nodes.push(node)
      }
      return nodes
    }
    return <></>
  }
  const subscriptionData = () => {
    const socket = new SockJS(import.meta.env.VITE_API_SOCK_ENDPOINT)
    client.value = Stomp.over(socket)
    client.value.connect(
      { Authorization: getToken() },
      () => {
        client.value && client.value.subscribe('/topic/pullLogger', (data: Stomp.Message) => {
          const message = JSON.parse(data.body) as LoggerMessage
          loggerMessage.value.push(message)
          scrollToBottom()
        })
      }
    )
  }
  const scrollToBottom = () => {
    if (panelRef.value && !isMouseInside.value) {
      panelRef.value.scrollTop = panelRef.value?.scrollHeight
    }
  }
  const downloadLog = async () => {
    const blob = await download(isEmpty(levels.value) ? '' : '?' + queryString(levels.value))
    downloadFile(blob, 'logs.log')
  }
  watchEffect(() => {
    const isDark = appStore.theme === 'dark'
    panelColor.value = isDark ? '#000000' : '#ffffff'
    textColor.value = isDark ? '#ffffff' : '#000000'
  })
  onMounted(() => {
    fetchData()
    subscriptionData()
  })
  onBeforeMount(() => {
    client.value && client.value.disconnect(() => { })
  })
  return () => (
    <>
      <div class={style.container}>
        <div class={style.operation}>
          <a-space size={size.value}>
            <a-space size={size.value}>
              <span style="color: var(--color-text-1);">{t('console.index.245126-0')}</span>
              <a-color-picker v-model={panelColor.value} showText disabledAlpha size={size.value} />
            </a-space>
            <a-space size={size.value}>
              <span style="color: var(--color-text-1);">{t('console.index.245126-1')}</span>
              <a-color-picker v-model={textColor.value} showText disabledAlpha size={size.value} />
            </a-space>
            <a-space size={size.value}>
              <span style="color: var(--color-text-1);">{t('console.index.245126-2')}</span>
              <a-select v-model={levels.value} onChange={onSelect} style={{ width: '200px' }} placeholder={t('console.index.245126-3')} multiple showHeaderOnEmpty allowClear size={size.value}>
                {{
                  header: () => (
                    <div style="padding: 6px 12px;">
                      <a-checkbox v-model={checked.value} onChange={onChecked}>{t('console.index.245126-4')}</a-checkbox>
                    </div>
                  ),
                  default: () => (
                    <>
                      <a-option>INFO</a-option>
                      <a-option>DEBUG</a-option>
                      <a-option>WARN</a-option>
                      <a-option>ERROR</a-option>
                    </>
                  )
                }}
              </a-select>
              <a-button onClick={onFilterData} status="success" type="primary" size={size.value}>{t('console.index.245126-5')}</a-button>
            </a-space>
          </a-space>
          <a-space size={size.value}>
            <a-button onClick={downloadLog} v-permission={permission} type="primary" size={size.value}>{t('console.index.245126-6')}</a-button>
            <a-button onClick={() => loggerMessage.value = []} status="danger" type="primary" size={size.value}>{t('console.index.245126-7')}</a-button>
          </a-space>
        </div>
        <div
          ref={panelRef}
          class={style.panel}
          style={{ background: panelColor.value, color: textColor.value }}
          onMouseenter={() => isMouseInside.value = true}
          onMouseleave={() => isMouseInside.value = false}
        >
          {buildPanel(loggerMessage.value)}
        </div>
      </div>
    </>
  )
})