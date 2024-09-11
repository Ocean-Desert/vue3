import { computed, defineComponent, onMounted, ref } from 'vue'
import { getNames, getValue, listByName, clearKey, clearName, clearAll } from '@/api/monitor/cache/index'
import type { SysCache } from '@/api/monitor/cache/type'
import { Message, TableColumnData, TableData } from '@arco-design/web-vue'
import { useClipboard, useWindowSize } from '@vueuse/core'
import { useViewSize } from '@/hooks/layout'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const { width } = useWindowSize()
  const { viewHeight } = useViewSize()
  const { text, copy, copied, isSupported } = useClipboard()
  const permission = ['monitor:cache:del']
  const cacheNameColumns: TableColumnData[] = [
    { title: t('cache.list.369138-0'), dataIndex: 'id', align: 'center' },
    { title: t('cache.list.369138-1'), dataIndex: 'cacheName', align: 'center' },
    { title: t('cache.list.369138-2'), dataIndex: 'cacheRemark', align: 'center' },
    {
      title: t('cache.list.369138-3'), align: 'center', render: (data: { record: TableData; column: TableColumnData; rowIndex: number; }) => (<>
        <a-button onClick={(e: Event) => { e.stopPropagation(); deleteCacheName(data.record) }} v-permission={permission} type="text" shape="circle" status="danger" size={size.value}>
          <icon-delete />
        </a-button>
      </>)
    },
  ]
  const cacheKeyColumns: TableColumnData[] = [
    { title: t('cache.list.369138-0'), dataIndex: 'id', align: 'center' },
    { title: t('cache.list.369138-4'), dataIndex: 'cacheKey', align: 'center' },
    {
      title: t('cache.list.369138-3'), align: 'center', render: (data: { record: TableData; column: TableColumnData; rowIndex: number; }) => (<>
        <a-button onClick={(e: Event) => { e.stopPropagation(); deleteCacheKey(data.record) }} v-permission={permission} type="text" shape="circle" status="danger" size={size.value}>
          <icon-delete />
        </a-button>
      </>)
    },
  ]
  const visible = ref(false)
  const cacheName = ref('')
  const cacheNames = ref<SysCache[]>([])
  const cacheKeys = ref<SysCache[]>([])
  const cacheForm = ref<SysCache>({})
  const onCacheKey = async (record: SysCache, ev: Event) => {
    const { data } = await getValue(cacheName.value, record.cacheKey as string)
    cacheForm.value = data as SysCache
    visible.value = true
  }
  const onCacheName = async (record: SysCache, ev: Event) => {
    cacheName.value = record.cacheName as string
    fetchDataByName()
  }
  const deleteCacheKey = async (record: SysCache) => {
    const { success } = await clearKey(record.cacheKey as string)
    if (success)
      Message.success(t('cache.list.369138-5', { label: record.cacheKey }))
    else
      Message.error(t('cache.list.369138-6', { label: record.cacheKey }))
    fetchDataByName()
  }
  const deleteCacheName = async (record: SysCache) => {
    const { success } = await clearName(record.cacheName as string)
    if (success)
      Message.success(t('cache.list.369138-7', { label: record.cacheName }))
    else
      Message.error(t('cache.list.369138-8', { label: record.cacheName }))
    fetchDataByName()
  }
  const fetchNamesData = async () => {
    const { data } = await getNames()
    data?.forEach((item, index) => {
      item.id = (index + 1)
    })
    cacheNames.value = data as SysCache[]
  }
  const fetchDataByName = async () => {
    if (!cacheName.value) return
    const { data } = await listByName(cacheName.value)
    cacheKeys.value = data?.map((item, index) => {
      return { id: (index + 1), cacheKey: item }
    }) as SysCache[]
  }
  const copyValue = () => {
    if (!isSupported.value) {
      Message.error(t('cache.list.369138-9'))
      return
    }
    copy(JSON.stringify(cacheForm.value.cacheValue))
    Message.success(t('cache.list.369138-10'))
  }
  const refreshNames = () => {
    Message.success(t('cache.list.369138-11'))
    fetchNamesData()
  }
  const refreshKeys = () => {
    Message.success(t('cache.list.369138-12'))
    fetchDataByName()
  }
  const onClear = async () => {
    await clearAll()
    visible.value = false
    cacheName.value = ''
    cacheNames.value = []
    cacheKeys.value = []
    cacheForm.value = {}
    fetchNamesData()
  }
  onMounted(() => {
    fetchNamesData()
  })
  return () => (
    <>
      <a-row gutter={20}>
        <a-col span={12}>
          <a-card title={t('cache.list.369138-13')} style={{ height: viewHeight.value + 'px', overflow: 'auto' }} size={size.value}>
            {{
              extra: () => <icon-refresh onClick={refreshNames} style={{ cursor: 'pointer' }} />,
              default: () => (
                <a-table columns={cacheNameColumns} data={cacheNames.value} onRowClick={onCacheName} pagination={false} bordered={false} size={size.value} />
              )
            }}
          </a-card>
        </a-col>
        <a-col span={12}>
          <a-card title={t('cache.list.369138-14')} style={{ height: viewHeight.value + 'px', overflow: 'auto' }} size={size.value}>
            {{
              extra: () => <icon-refresh onClick={refreshKeys} style={{ cursor: 'pointer' }} />,
              default: () => (
                <a-table columns={cacheKeyColumns} data={cacheKeys.value} onRowClick={onCacheKey} pagination={false} bordered={false} size={size.value} />
              )
            }}
          </a-card>
        </a-col>
        <a-drawer
          title={t('cache.list.369138-15')}
          unmountOnClose={true}
          v-model={[visible.value, 'visible']}
          width={width.value > 600 ? 600 : '100%'}
          okButtonProps={{ size: size.value }}
          cancelButtonProps={{ size: size.value }}
        >
          {{
            default: () => (<>
              <a-form model={cacheForm.value} layout="vertical" size={size.value}>
                <a-form-item field="cacheName" label={t('cache.list.369138-1')}>
                  <a-input v-model={cacheForm.value.cacheName} readonly size={size.value} />
                </a-form-item>
                <a-form-item field="cacheKey" label={t('cache.list.369138-4')}>
                  <a-input v-model={cacheForm.value.cacheKey} readonly size={size.value} />
                </a-form-item>
                <a-form-item field="cacheKey" label={t('cache.list.369138-4')}>
                  <a-textarea defaultValue={JSON.stringify(cacheForm.value.cacheValue)} autoSize={{ minRows: 2, maxRows: 15 }} readonly />
                </a-form-item>
              </a-form>
            </>),
            footer: () => (
              <a-space size={size.value}>
                <a-button onClick={() => visible.value = false} size={size.value}>{t('cache.list.369138-16')}</a-button>
                <a-popconfirm content={t('cache.list.369138-17')} okText={t('cache.list.369138-18')} cancelText={t('cache.list.369138-16')} onOk={onClear}>
                  <a-button v-permission={permission} type="primary" status="danger" size={size.value}>{t('cache.list.369138-19')}</a-button>
                </a-popconfirm>
                <a-button onClick={() => copyValue()} type="primary" size={size.value}>复制{t('cache.list.369138-15')}</a-button>
              </a-space>
            )
          }}
        </a-drawer>
      </a-row>
    </>
  )
})