import type { TableData } from '@arco-design/web-vue'

export interface SysCache extends TableData {
  id?: number
  cacheName?: string
  cacheKey?: string
  cacheValue?: any
  cacheRemark?: string
}