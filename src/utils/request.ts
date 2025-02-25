import axios, { AxiosResponse, AxiosRequestConfig, AxiosError, AxiosHeaders, InternalAxiosRequestConfig, AxiosInstance } from 'axios'
import router from '@/router/index'
import qs from 'qs'
import { Message } from '@arco-design/web-vue'
import { getToken } from '@/utils/auth'
import { isBlob } from './is'
import { useAppStore, useUserStore } from '@/store'
import useLocale from '@/hooks/locale'
import { localStorage } from './storage'
import { computed } from 'vue'
import i18n from '@/locale'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_CONTEXT_PATH,
  timeout: 10000,
  headers: {
    get: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    delete: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    post: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8'
    },
    put: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8'
    }
  }
})

const errorHandler = (error: ApiSpace.Result<any>) => {
  Message.error({
    content: (error.data as string) || error.msg || '未知错误',
    closable: true
  })
}

// 请求拦截器
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const authorization = getToken()
  if (authorization) {
    if (!config.headers) {
      config.headers = new AxiosHeaders()
    }
    config.headers['Authorization'] = authorization
  }
  (config.headers as AxiosHeaders)['Accept-Language'] = i18n.global.locale.value || 'zh-CN'
  // if ((config.method === 'get' || config.method === 'delete') && config.params) {
  //   const url = config.url + '?' + qs.stringify(config.params)
  //   config.params = {}
  //   config.url = url
  // }
  return config
},
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiSpace.Result<any>>) => {
    const userStore = useUserStore()
    const { data } = response
    if (isBlob(data)) {
      return data
    }
    switch (data.status) {
      case 200: return data
      case 401: {
        errorHandler(data)
        router.push({
          path: '/auth',
          replace: true
        })
        userStore.logoutCallBack()
        break
      }
      default: {
        errorHandler(data)
        return Promise.reject(data)
      }
    }
    return data
  },
  (error: AxiosError<ApiSpace.Result<any>>) => {
    const { response } = error
    errorHandler(response?.data || { status: 500, success: false, msg: '未知错误' })
    return Promise.reject(error)
  }
)

export default http