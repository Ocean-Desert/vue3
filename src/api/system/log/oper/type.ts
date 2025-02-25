import type { BaseEntity, BaseEntityParams } from '@/api/common/type'

export interface SysLog extends BaseEntity {
  id?: number
  operName?: string
  ipaddr?: string
  address?: string
  serverAddress?: string
  method?: string
  methodName?: string
  methodParams?: string
  api?: string
  operationDesc?: string
  startTime?: string
  endTime?: string
  runTime?: number
  returnValue?: string
  exceptionInfo?: string
  params?: object
}

export interface SysLogParams extends BaseEntityParams {
  operName?: string
  operationDesc?: string
  method?: string
  api?: string
  params?: any
}

