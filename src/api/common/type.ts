import { AxiosProgressEvent } from 'axios'

export interface LoginData {
  username: string,
  password: string,
  captcha: string,
  uuid: string
}

export interface TreeSelect {
  id: number,
  label: string
  children?: TreeSelect[]
}

export interface SysFile extends BaseEntity {
  id: string
  path: string
  states: string
  startTime: string
  endTime: string
  handleTime: number
  name: string
}

export interface BaseEntity {
  createTime?: string
  createBy?: string
  updateTime?: string
  updateBy?: string
  flag?: string
  remark?: string
  params?: Map<string, any>
}

export type UploadOptions = {
  action?: string
  headers?: Record<string, string>
  onProgress?: (progressEvent: AxiosProgressEvent) => void
}

export interface Captcha { 
  captchaOnOff: boolean
  uuid?: string
  img?: string
}

export interface EditPasswordParams { 
  newPassword: string,
  oldPassword: string,
}

export interface EditUserParams {
  nickName?: string
  phone?: string
  avatar?: string
  sex?: string
}

export interface DownloadParams {
  file: string
}