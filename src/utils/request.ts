import axios, { AxiosResponse, AxiosRequestConfig, AxiosError, AxiosInstance, AxiosHeaders } from 'axios'
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


//开发环境下解决不能添加cookie
// if (import.meta.env.MODE === `development`) {
//   axios.defaults.headers.post[`User`] = `admin`  //与后台配合识别登录用户
//   axios.defaults.headers.post[`Uid`] = `12345678913` //与后台配合识别登录用户
// }
// axios.defaults.headers.post[`Content-Type`] = `application/json;charset=UTF-8`

// const $http = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })
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

const errorHandler = (error: ApiSpace.Result) => {
  Message.error({
    content: error.data as string || error.msg,
    closable: true
  })
}

// 请求拦截器
http.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const authorization = getToken()
  if (authorization) {
    if (!config.headers) {
      config.headers = {}
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
http.interceptors.response.use(async (response: AxiosResponse<ApiSpace.Result>) => {
  const userStore = useUserStore()
  const { data } = response
  if (isBlob(data)) {
    return Promise.resolve(data)
  }
  switch (data.status) {
    case 200: return Promise.resolve(data)
    case 401: {
      errorHandler(data)
      router.push({
        path: '/login',
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
},
  (error: AxiosError<ApiSpace.Result>) => {
    const { response } = error
    errorHandler(response?.data || { status: 500, success: false, msg: '未知错误' })
    return Promise.reject(error)
  },
)

export default http