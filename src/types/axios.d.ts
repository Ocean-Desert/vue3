import { AxiosResponse } from 'axios'
import { ApiSpace } from './common'

declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T
  }

  export interface AxiosInterceptorManager<V> {
    use<T = V>(
      onFulfilled?: ((value: V) => T | Promise<T>) | null,
      onRejected?: ((error: any) => any) | null,
      options?: { synchronous?: boolean; runWhen?: (config: any) => boolean }
    ): number
  }
} 