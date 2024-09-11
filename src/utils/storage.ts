/**
 * 封装操作localstorage本地存储的方法
 */
export const localStorage = {
  //存储
  set(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  //取出数据
  get<T>(key: string, defaultValue?: T) {
    const value = window.localStorage.getItem(key)
    if (value && value != 'undefined' && value != 'null') {
      return <T>JSON.parse(value)
    }
    return defaultValue
  },
  // 删除数据
  remove(key: string) {
    window.localStorage.removeItem(key)
  }
};

/**
 * 封装操作sessionStorage本地存储的方法
 */
export const sessionStorage = {
  //存储
  set(key: string, value: any) {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },
  //取出数据
  get<T>(key: string, defaultValue?: T) {
    const value = window.sessionStorage.getItem(key)
    if (value && value != 'undefined' && value != 'null') {
      return <T>JSON.parse(value)
    }
    return defaultValue
  },
  // 删除数据
  remove(key: string) {
    window.sessionStorage.removeItem(key)
  }
}