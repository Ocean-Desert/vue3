import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { useSseService } from '@/hooks/sse'
import { info } from '@/api/monitor/server'
import style from './index.module.scss'
import type { ComputerInfo, NetworkInfo, StatusInfo } from '@/api/monitor/server/type'
import { convertBytes, convertPercentage } from '@/utils/convert'
import useChartOption from '@/hooks/chartOption'
import Chart from '@/components/chart'
import dayjs from 'dayjs'
import { isArray } from '@/utils/is'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'
import { useCssVar } from '@vueuse/core'

export default defineComponent(() => {
  const { t } = useI18n()
  const appSotre = useAppStore()
  const size = computed(() => appSotre.size)
  useSseService({
    url: import.meta.env.VITE_API_CONTEXT_PATH + '/monitor/server/connect',
    onopen: () => {
      fetchData()
    },
    onmessage: (message: MessageEvent<string>) => {
      const data = JSON.parse(message.data)
      if (isArray(data)) {
        console.log(data);
        networkInfo.value = data as NetworkInfo[]
        if (key.value === -1) {
          key.value = data.length - 1
          networkData.value = data[data.length - 1]
        } else {
          networkData.value = data[key.value]
        }
      } else {
        statusInfo.value = data as StatusInfo
      }
      buildEchart()
    }
  })
  const key = ref(-1)
  const dateData = ref<string[]>([])
  const bytesRecv = ref<number[]>([])
  const bytesSent = ref<number[]>([])

  const loading = ref(true)
  const computerInfo = ref<ComputerInfo>()
  const networkData = ref<NetworkInfo>()
  const networkInfo = ref<NetworkInfo[]>([])
  const statusInfo = ref<StatusInfo>()
  const graphicsCard = ref<{ vendor: string; name: string; versionInfo: string; vRam: number; deviceId: string }>()
  const memory = ref<{ manufacturer: string; memoryType: string; bankLabel: string; capacity: number; clockSpeed: number; }>()
  const network = ref<{ mount: string; displayName: string; macAddr: string; ipv4: string[]; ipv6: string[]; }>()
  const soundCard = ref<{ codec: string; name: string; driverVersion: string; }>()
  const jvmInfo = computed(() => {
    return [
      { label: t('views.server.jvm.name'), value: statusInfo.value && statusInfo.value.jvm.vmName, span: 3 },
      { label: t('views.server.jvm.version'), value: statusInfo.value && statusInfo.value.jvm.vmVersion },
      { label: t('views.server.jvm.startTime'), value: statusInfo.value && dayjs(statusInfo.value.jvm.startTime).format('YYYY-MM-DD HH:mm:ss') },
      { label: t('views.server.jvm.uptime'), value: statusInfo.value && dayjs(statusInfo.value.jvm.uptime).locale('zh-cn').format('HH:mm:ss') },
      { label: t('views.server.jvm.threadCount'), value: statusInfo.value && statusInfo.value.jvm.threadCount },
      { label: t('views.server.jvm.gcCount'), value: statusInfo.value && statusInfo.value.jvm.gcCount },
      { label: t('views.server.jvm.loadClassCount'), value: statusInfo.value && statusInfo.value.jvm.loadClassCount },
      { label: t('views.server.jvm.heapMemoryMax'), value: statusInfo.value && convertBytes(statusInfo.value.jvm.heapMemoryMax as number) },
      { label: t('views.server.jvm.heapMemoryInit'), value: statusInfo.value && convertBytes(statusInfo.value.jvm.heapMemoryInit as number) },
      { label: t('views.server.jvm.heapMemoryUsed'), value: statusInfo.value && convertBytes(statusInfo.value.jvm.heapMemoryUsed as number) },
      { label: t('views.server.jvm.nonHeapMemoryMax'), value: statusInfo.value && convertBytes(statusInfo.value.jvm.nonHeapMemoryMax as number) },
      { label: t('views.server.jvm.nonHeapMemoryInit'), value: statusInfo.value && convertBytes(statusInfo.value.jvm.nonHeapMemoryInit as number) },
      { label: t('views.server.jvm.nonHeapMemoryUsed'), value: statusInfo.value && convertBytes(statusInfo.value.jvm.nonHeapMemoryUsed as number) },
    ]
  })
  const fetchData = async () => {
    loading.value = true
    const { data } = await info()
    loading.value = false
    computerInfo.value = data
    graphicsCard.value = data?.graphicsCard[0]
    memory.value = data?.memory[0]
    network.value = data?.network[0]
    soundCard.value = data?.soundCard[0]
  }
  const buildEchart = () => {
    const date = dayjs().format('HH:mm:ss')
    const maxPoints = 30 // 最多显示30个点

    if (dateData.value.length >= maxPoints) {
      dateData.value.shift()
      bytesRecv.value.shift()
      bytesSent.value.shift()
    }

    dateData.value.push(date)
    if (networkData.value) {
      // 转换为 KB/s
      bytesRecv.value.push(+(networkData.value.bytesRecv / 1024).toFixed(2))
      bytesSent.value.push(+(networkData.value.bytesSent / 1024).toFixed(2))
    }
  }
  const changeNetwork = () => {
    dateData.value = []
    bytesRecv.value = []
    bytesSent.value = []
    networkData.value = networkInfo[key.value]
  }
  const greenColor = useCssVar('--green-6', document.documentElement)
  const orangeColor = useCssVar('--orange-6', document.documentElement)
  // 获取主题色并转换为 RGB 格式
  const getRgbColor = (cssVar: string, opacity: number = 1) => {
    const color = useCssVar(cssVar, document.documentElement)
    // 假设 CSS 变量值是 "255, 128, 0" 这样的格式
    return `rgba(${color.value || '0, 0, 0'}, ${opacity})`
  }

  const { chartOption } = useChartOption((isDark) => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          return `<div style="min-width: 175px;">
            <div style="overflow: hidden;">
              <div style="float: left;">${t('views.server.network.time')}：</div>
              <div style="float: right;">${params[0].axisValue}</div>
            </div>
            <div style="overflow: hidden;">
              <div style="float: left;">
                <span style="display: inline-block; margin-right: 5px; border-radius: 50%; width: 10px; height: 10px;background-color: rgb(var(--orange-6));"></span>
                ${t('views.server.network.bytesSent')}：
              </div>
              <div style="float: right;">${convertBytes(params[1].data)}/s</div>
            </div>
            <div style="overflow: hidden;">
              <div style="float: left;">
                <span style="display: inline-block; margin-right: 5px; border-radius: 50%; width: 10px; height: 10px;background-color: rgb(var(--green-6));"></span>
                ${t('views.server.network.bytesRecv')}：
              </div>
              <div style="float: right;">${convertBytes(params[0].data)}/s</div>
            </div>
          </div>`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dateData.value,
        axisLabel: {
          formatter: (value: string) => value.substring(value.indexOf(' ') + 1)
        },
        axisTick: { show: false },
        axisLine: { show: false },
        axisPointer: {
          snap: true,
          lineStyle: {
            type: 'solid'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: t('views.server.network.unit'),
        axisLabel: {
          formatter: (value: number) => convertBytes(value)
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: t('views.server.network.bytesRecv'),
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            color: 'rgb(var(--green-6))'
          },
          areaStyle: {
            color: '#00b42a'
          },
          data: bytesRecv.value
        },
        {
          name: t('views.server.network.bytesSent'),
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            color: 'rgb(var(--orange-6))'
          },
          areaStyle: {
            color: '#ff7d00'
          },
          data: bytesSent.value
        }
      ]
    }
  })
  return () => (
    <>
      <a-row gutter={[20, 20]}>
        <a-col span="24">
          <a-card title={t('views.server.status')} size={size.value}>
            <div class={style.statusBox}>
              {statusInfo.value && statusInfo.value.status.map(item => {
                const percent = (((item.value / item.limit) * 100) / 100).toFixed(2)
                const status = Number(percent) > 0.9 ? 'danger' : Number(percent) > 0.7 ? 'warning' : 'normal'
                return <div class={style.statusItem}>
                  <div class={style.statusTitle}>{item.title}</div>
                  <a-progress size="large" type="circle" status={status} percent={percent} />
                  <div class={style.statusDesc}>{item.desc}</div>
                </div>
              })}
            </div>
          </a-card>
        </a-col>
        <a-col span="24">
          <a-spin loading={loading.value} tip={t('views.server.hardware.tip')}>
            <a-card title={t('views.server.hardware.title')} size={size.value}>
              {{
                extra: () => <icon-refresh onClick={fetchData} style={{ cursor: 'pointer' }} />,
                default: () => (
                  <>
                    <a-row gutter={[20, 20]}>
                      <a-col span="24">
                        <a-card title={t('views.server.disk title')} size={size.value}>
                          <a-list bordered={false} size={size.value}>
                            <a-list-item class={style.diskHead}>
                              <a-row>
                                <a-col span="4">{t('views.server.disk title')}</a-col>
                                <a-col span="4">{t('views.server.disk mount')}</a-col>
                                <a-col span="4">{t('views.server.disk type')}</a-col>
                                <a-col span="4">{t('views.server.disk totalSpace')}</a-col>
                                <a-col span="4">{t('views.server.disk usableSpace')}</a-col>
                                <a-col span="4">{t('views.server.disk availability')}</a-col>
                              </a-row>
                            </a-list-item>
                            {
                              computerInfo.value?.disk.map(item => (
                                <a-list-item class={style.diskBody}>
                                  <a-row>
                                    <a-col span="4">{item.name}</a-col>
                                    <a-col span="4">{item.mount}</a-col>
                                    <a-col span="4">{item.type}</a-col>
                                    <a-col span="4">{convertBytes(item.totalSpace)}</a-col>
                                    <a-col span="4">{convertBytes(item.usableSpace)}</a-col>
                                    <a-col span="4">{convertPercentage(item.usableSpace, item.totalSpace)}</a-col>
                                  </a-row>
                                </a-list-item>
                              ))
                            }
                          </a-list>
                        </a-card>
                      </a-col>
                      <a-col span="8">
                        <a-card title={t('views.server.cpu title')} size={size.value}>
                          <a-list bordered={false} maxHeight={250} size={size.value}>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.cpu name')}:</span>
                              <span class={style.value}>{computerInfo.value?.central.name}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.cpu vendor')}:</span>
                              <span class={style.value}>{computerInfo.value?.central.vendor}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.cpu model')}:</span>
                              <span class={style.value}>{computerInfo.value?.central.model}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.cpu physicalProcessorCount')}:</span>
                              <span class={style.value}>{computerInfo.value?.central.physicalProcessorCount}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.cpu logicalProcessorCount')}:</span>
                              <span class={style.value}>{computerInfo.value?.central.logicalProcessorCount}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.cpu vendorFreq')}:</span>
                              <span class={style.value}>{computerInfo.value && (computerInfo.value?.central.vendorFreq / 1000 / 1000 / 1000) + 'GHz'}</span>
                            </a-list-item>
                          </a-list>
                        </a-card>
                      </a-col>
                      <a-col span="8">
                        <a-card title={t('views.server.networkCard.title')} size={size.value}>
                          {{
                            extra: () => (
                              <a-select
                                style={{ width: '100px' }}
                                defaultValue={0}
                                options={computerInfo.value?.network.map((item, key) => ({ label: item.mount, value: key }))}
                                onChange={(key) => network.value = computerInfo.value?.network[key]}
                                size={size.value}
                              />
                            ),
                            default: () =>
                            (<a-list bordered={false} maxHeight={250} size={size.value}>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.networkCard.name')}:</span>
                                <span class={style.value}>{network.value?.mount}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.networkCard.details')}:</span>
                                <span class={style.value}>{network.value?.displayName}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.networkCard.mac')}:</span>
                                <span class={style.value}>{network.value?.macAddr}</span>
                              </a-list-item>
                              {
                                network.value?.ipv4.map(item => (
                                  <a-list-item class={style.listBetween}>
                                    <span class={style.label}>IPv4:</span>
                                    <span class={style.value}>{item}</span>
                                  </a-list-item>
                                ))
                              }
                              {
                                network.value?.ipv6.map(item => (
                                  <a-list-item class={style.listBetween}>
                                    <span class={style.label}>IPv6:</span>
                                    <span class={style.value}>{item}</span>
                                  </a-list-item>
                                ))
                              }
                            </a-list>)
                          }}

                        </a-card>
                      </a-col>
                      <a-col span="8">
                        <a-card title={t('views.server.graphicsCard.title')} size={size.value}>
                          {{
                            extra: () => (
                              <a-select
                                style={{ width: '100px' }}
                                defaultValue={0}
                                options={computerInfo.value?.graphicsCard.map((item, key) => ({ label: item.name, value: key }))}
                                size={size.value}
                                onChange={(key) => graphicsCard.value = computerInfo.value?.graphicsCard[key]}
                              />
                            ),
                            default: () =>
                            (<a-list bordered={false} maxHeight={250} size={size.value}>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.graphicsCard.name')}:</span>
                                <span class={style.value}>{graphicsCard.value?.name}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.graphicsCard.vendor')}:</span>
                                <span class={style.value}>{graphicsCard.value?.vendor}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.graphicsCard.version')}:</span>
                                <span class={style.value}>{graphicsCard.value?.versionInfo}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.graphicsCard.ram')}:</span>
                                <span class={style.value}>{convertBytes(graphicsCard.value?.vRam as number)}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.graphicsCard.deviceId')}:</span>
                                <span class={style.value}>{graphicsCard.value?.deviceId}</span>
                              </a-list-item>
                            </a-list>)
                          }}

                        </a-card>
                      </a-col>
                      <a-col span="8">
                        <a-card title={t('views.server.memory.title')} size={size.value}>
                          {{
                            extra: () => (
                              <a-select
                                style={{ width: '100px' }}
                                defaultValue={0}
                                options={computerInfo.value?.memory.map((item, key) => ({ label: item.bankLabel, value: key }))}
                                size={size.value}
                                onChange={(key) => memory.value = computerInfo.value?.memory[key]}
                              />
                            ),
                            default: () =>
                            (<a-list bordered={false} maxHeight={250} size={size.value}>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.memory.manufacturer')}:</span>
                                <span class={style.value}>{memory.value?.manufacturer}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.memory.type')}:</span>
                                <span class={style.value}>{memory.value?.memoryType}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.memory.slot')}:</span>
                                <span class={style.value}>{memory.value?.bankLabel}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.memory.size')}:</span>
                                <span class={style.value}>{memory.value && convertBytes(memory.value?.capacity)}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.memory.clockSpeed')}:</span>
                                <span class={style.value}>{memory.value && (memory.value?.clockSpeed / 1000 / 1000 + 'MHz')}</span>
                              </a-list-item>
                            </a-list>)
                          }}

                        </a-card>
                      </a-col>
                      <a-col span="8">
                        <a-card title={t('views.server.soundCard.title')} size={size.value}>
                          {{
                            extra: () => (
                              <a-select
                                style={{ width: '100px' }}
                                defaultValue={0}
                                options={computerInfo.value?.soundCard.map((item, key) => ({ label: item.name, value: key }))}
                                size={size.value}
                                onChange={(key) => soundCard.value = computerInfo.value?.soundCard[key]}
                              />
                            ),
                            default: () =>
                            (<a-list bordered={false} maxHeight={250} size={size.value}>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.soundCard.manufacturer')}:</span>
                                <span class={style.value}>{soundCard.value?.codec}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.soundCard.model')}:</span>
                                <span class={style.value}>{soundCard.value?.name}</span>
                              </a-list-item>
                              <a-list-item class={style.listBetween}>
                                <span class={style.label}>{t('views.server.soundCard.version')}:</span>
                                <span class={style.value}>{soundCard.value?.driverVersion}</span>
                              </a-list-item>
                            </a-list>)
                          }}

                        </a-card>
                      </a-col>
                      <a-col span="8">
                        <a-card title={t('views.server.mainboard.title')} size={size.value}>
                          <a-list bordered={false} maxHeight={250} size={size.value}>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.mainboard.manufacturer')}:</span>
                              <span class={style.value}>{computerInfo.value?.baseBoard.manufacturer}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.mainboard.model')}:</span>
                              <span class={style.value}>{computerInfo.value?.baseBoard.model}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.mainboard.serial')}:</span>
                              <span class={style.value}>{computerInfo.value?.baseBoard.serialNumber}</span>
                            </a-list-item>
                            <a-list-item class={style.listBetween}>
                              <span class={style.label}>{t('views.server.mainboard.version')}:</span>
                              <span class={style.value}>{computerInfo.value?.baseBoard.version}</span>
                            </a-list-item>
                          </a-list>
                        </a-card>
                      </a-col>
                    </a-row>
                  </>
                )
              }}
            </a-card>
          </a-spin>
        </a-col>
        <a-col span="12">
          <a-card title={t('views.server.network.title')} size={size.value}>
            {{
              extra: () => (
                <a-select
                  style={{ width: '100px' }}
                  v-model={key.value}
                  options={networkInfo.value.map((item, key) => ({ label: item.name, value: key }))}
                  size={size.value}
                  onChange={changeNetwork}
                />),
              default: () => (
                <>
                  <div class={style.networkBox}>
                    <div class={style.networkItem}>
                      <div class={style.networkTitle}>{t('views.server.network.totalBytesRecv')}</div>
                      <div class={style.networkValue} style="color: rgb(var(--red-6));">{networkData.value && convertBytes(networkData.value?.totalBytesRecv)}</div>
                    </div>
                    <div class={style.networkItem}>
                      <div class={style.networkTitle}>{t('views.server.network.totalBytesSent')}</div>
                      <div class={style.networkValue} style="color: rgb(var(--arcoblue-6));">{networkData.value && convertBytes(networkData.value?.totalBytesSent)}</div>
                    </div>
                    <div class={style.networkItem}>
                      <div class={style.networkTitle}>{t('views.server.network.bytesRecv')}</div>
                      <div class={style.networkValue} style="color: rgb(var(--green-6));">{networkData.value && convertBytes(networkData.value?.bytesRecv)}/S</div>
                    </div>
                    <div class={style.networkItem}>
                      <div class={style.networkTitle}>{t('views.server.network.bytesSent')}</div>
                      <div class={style.networkValue} style="color: rgb(var(--orange-6));">{networkData.value && convertBytes(networkData.value?.bytesSent)}/S</div>
                    </div>
                  </div>
                  <Chart option={chartOption.value} height={'400px'} />
                </>
              )
            }}

          </a-card>
        </a-col>
        <a-col span="12">
          <a-card title={t('views.server.os.title')} size={size.value}>
            <a-list bordered={false} maxHeight={618} size={size.value}>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.name')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.osArch}</span>
              </a-list-item>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.version')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.osVersion}</span>
              </a-list-item>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.osName')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.osName}</span>
              </a-list-item>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.hostName')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.hostName}</span>
              </a-list-item>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.hostAddress')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.hostAddress}</span>
              </a-list-item>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.userName')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.userName}</span>
              </a-list-item>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.userHome')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.userHome}</span>
              </a-list-item>
              <a-list-item class={style.listBetween}>
                <span class={style.label}>{t('views.server.os.userDir')}:</span>
                <span class={style.value}>{statusInfo.value && statusInfo.value.os.userDir}</span>
              </a-list-item>
            </a-list>
          </a-card>
        </a-col>
        <a-col span="24">
          <a-card title={t('views.server.jvm.title')} size={size.value}>
            <a-descriptions data={jvmInfo.value} bordered={true} size={size.value} />
          </a-card>
        </a-col>
      </a-row>
    </>
  )
})