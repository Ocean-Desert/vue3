import { TableData } from '@arco-design/web-vue'

export interface SysLog extends TableData {
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

export interface SysLogParams extends ApiSpace.PageParams {
  operName?: string
  operationDesc?: string
  method?: string
  api?: string
  params?: any
}

