import request from '@/utils/request'
import type { Captcha, DownloadParams, EditPasswordParams, EditUserParams, LoginData, RegisterData, SysFile, UploadOptions } from './type'
import { AxiosProgressEvent } from 'axios'
import { UserInfo } from '@/store/modules/user/types'

export const login = (data: LoginData) => {
  return request<unknown, Promise<ApiSpace.Result<string>>>({
    url: '/common/login',
    method: 'post',
    data,
  })
}

export const sendEmailCode = (email: string) => {
  return request<unknown, Promise<ApiSpace.Result<string>>>({
    url: '/common/sendEmailCode',
    method: 'get',
    params: { email },
  })
}

export const register = (data: RegisterData) => {
  return request<unknown, Promise<ApiSpace.Result<string>>>({
    url: '/common/register',
    method: 'post',
    data,
  })
}

export const captcha = () => {
  return request<unknown, Promise<ApiSpace.Result<Captcha>>>({
    url: '/common/captcha',
    method: 'get'
  })
}

export const logout = () => {
  return request<unknown, Promise<ApiSpace.Result<string>>>({
    url: '/common/logout',
    method: 'get'
  })
}

export const getPublicKey = () => {
  return request<unknown, Promise<ApiSpace.Result<string>>>({
    url: '/common/getPublicKey',
    method: 'get'
  })
}

export const userInfo = () => {
  return request<unknown, Promise<ApiSpace.Result<UserInfo>>>({
    url: '/common/userInfo',
    method: 'get'
  })
}

export const upload = (
  file: FormData,
  options?: UploadOptions
) => request<FormData, Promise<ApiSpace.Result<SysFile>>>({
  url: options?.action || '/file/upload',
  method: 'post',
  data: file,
  headers: {
    'Content-Type': 'multipart/form-data',
    ...options?.headers
  },
  onUploadProgress: options?.onProgress
})

export const download = (params: DownloadParams) => {
  return request<unknown, Promise<Blob>>({
    url: '/file/download',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

export const preview = (params: DownloadParams) => {
  return request<unknown, Promise<Blob>>({
    url: '/file/preview',
    method: 'get',
    params,
    responseType: 'blob',
  })
}

export const editUser = (data: EditUserParams) => { 
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/user/edit',
    method: 'put',
    data,
  })
}

export const editPassword = (data: EditPasswordParams) => {
  return request<unknown, Promise<ApiSpace.Result<boolean>>>({
    url: '/system/user/editPassword',
    method: 'put',
    data,
  })
}
