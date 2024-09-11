export interface LoggerMessage {
  body: string
  timestamp: string
  threadName: string
  className: string
  level: LoggerLevel
  exception?: string
  cause: string
}
export type LoggerLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
