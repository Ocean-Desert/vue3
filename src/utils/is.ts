const options = Object.prototype.toString

export function isArray(obj: any): obj is any[] {
  return options.call(obj) === '[object Array]'
}

export function isObject(obj: any): obj is { [key: string]: any } {
  return options.call(obj) === '[object Object]'
}

export function isString(obj: any): obj is string {
  return options.call(obj) === '[object String]'
}

export function isNumber(obj: any): obj is number {
  return options.call(obj) === '[object Number]' && obj === obj
}

export function isRegExp(obj: any) {
  return options.call(obj) === '[object RegExp]'
}

export function isFile(obj: any): obj is File {
  return options.call(obj) === '[object File]'
}

export function isBlob(obj: any): obj is Blob {
  return options.call(obj) === '[object Blob]'
}

export function isDate(obj: any): obj is Date {
  return options.call(obj) === '[object Date]'
}

export function isUndefined(obj: any): obj is undefined {
  return obj === undefined
}

export function isNull(obj: any): obj is null {
  return obj === null
}

export function isFunction(obj: any): obj is (...args: any[]) => any {
  return typeof obj === 'function'
}

export function isEmptyObject(obj: any): boolean {
  return isObject(obj) && Object.keys(obj).length === 0
}

export function isExist(obj: any): boolean {
  return obj || obj === 0
}

export function isWindow(el: any): el is Window {
  return el === window
}

export function isEmpty(array: any[]): boolean {
  return array === null || array === undefined || array.length === 0
}

