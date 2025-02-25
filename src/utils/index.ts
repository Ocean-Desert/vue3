type TargetContext = '_self' | '_parent' | '_blank' | '_top'
export type TurnCaseType = 'ALL_CAPS' | 'ALL_LOWERCASE' | 'FIRST_CAPS'

/**
 * 打开窗口
 * @param url 
 * @param opts 
 */
export const openWindow = (
  url: string,
  opts?: { target?: TargetContext;[key: string]: any }
) => {
  const { target = '_blank', ...others } = opts || {}
  window.open(
    url,
    target,
    Object.entries(others)
      .reduce((preValue: string[], curValue) => {
        const [key, value] = curValue
        return [...preValue, `${key}=${value}`]
      }, [])
      .join(',')
  )
}

/**
 * 下载文件
 * @param blob 
 * @param filename 
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const blobUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(blobUrl)
  document.body.removeChild(a)
}

/**
 * url正则匹配
 */
export const regexUrl = new RegExp(
  '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  'i'
)

/**
 * 校验数据类型
 * @param obj 
 * @returns 
 */
export const typeOf = (obj: any): string => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

/**
 * 防抖
 * debounce(() => {
      console.log('加载数据')
    }, 500)
 */
export const debounce = (() => {
  let timer: NodeJS.Timeout | null = null
  return (callback: () => void, wait: number = 800) => {
    timer && clearTimeout(timer)
    timer = setTimeout(callback, wait)
  }
})()

/**
 * 节流
 */
export const throttle = (() => {
  let last: number = 0
  return (callback: () => void, wait: number = 800) => {
    let now = +new Date()
    if (now - last > wait) {
      callback()
      last = now
    }
  }
})()

/**
 * 手机号码脱敏
 * @param mobile 
 * @returns 
 */
export const hideMobile = (mobile: string): string => {
  return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2")
}

/**
 * 大小写转换
 * @param str 待转换的字符串
 * @param type 1-全大写 2-全小写 3-首字母大写
 * @returns 
 */
export const turnCase = (str: string, type: TurnCaseType): string => {
  switch (type) {
    case 'ALL_CAPS':
      return str.toUpperCase()
    case 'ALL_LOWERCASE':
      return str.toLowerCase()
    case 'FIRST_CAPS':
      return str[0].toUpperCase() + str.substring(1).toLowerCase()
    default:
      return str
  }
}

/**
 * 解析URL参数
 * @returns 
 */
export const getSearchParams = (): Record<string, string> => {
  const searchPar = new URLSearchParams(window.location.search)
  const paramsObj: Record<string, string> = {}
  for (const [key, value] of searchPar.entries()) {
    paramsObj[key] = value
  }
  return paramsObj
}


/**
 * 数组对象根据字段去重
 * @param arr 数组
 * @param key 字段名
 * @returns 
 */
export const uniqueArrayObject = <T>(arr: T[] = [], key: keyof T): T[] => {
  if (arr.length === 0) return []

  let list: T[] = []
  const map: Record<string, T> = {}

  arr.forEach((item) => {
    if (!map[String(item[key])]) {
      map[String(item[key])] = item
    }
  })

  list = Object.values(map)

  return list
}

/**
 * 滚动到页面顶部
 */
export const scrollToTop = (): void => {
  const height: number = document.documentElement.scrollTop || document.body.scrollTop

  if (height > 0) {
    window.requestAnimationFrame(scrollToTop)
    window.scrollTo(0, height - height / 8)
  }
}

/**
 * uuid
 * @returns 
 */
export const uuid = (): string => {
  const tempUrl: string = URL.createObjectURL(new Blob())
  const generatedUuid: string = tempUrl.toString()
  URL.revokeObjectURL(tempUrl)
  return generatedUuid.substring(generatedUuid.lastIndexOf('/') + 1)
}

/**
 * 金额格式化
 * @param number 要格式化的数字
 * @param decimals 保留几位小数
 * @param dec_point 小数点符号
 * @param thousands_sep 千分位符号
 * @returns 
 */
export const moneyFormat = (
  number: number | string,
  decimals: number,
  dec_point: string = '.',
  thousands_sep: string = ','
): string => {
  number = (number + '').replace(/[^0-9+-Ee.]/g, '')
  const n: number = !isFinite(+number) ? 0 : +number
  const prec: number = !isFinite(+decimals) ? 2 : Math.abs(decimals)
  const sep: string = typeof thousands_sep === 'undefined' ? ',' : thousands_sep
  const toFixedFix = (n: number, prec: number): string => {
    const k: number = Math.pow(10, prec)
    return '' + Math.ceil(n * k) / k
  }
  const s: string[] = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
  const re: RegExp = /(-?\d+)(\d{3})/
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2')
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec_point)
}

interface ListItem {
  [key: string]: string
}

/**
 * 模糊搜索
 * @param list 原数组
 * @param keyWord 查询的关键词
 * @param attribute 数组需要检索属性
 * @returns 
 */
export const fuzzyQuery = (
  list: ListItem[],
  keyWord: string,
  attribute: string = 'name'
): ListItem[] => {
  const reg: RegExp = new RegExp(keyWord)
  const result: ListItem[] = []
  for (let i = 0; i < list.length; i++) {
    if (reg.test(list[i][attribute])) {
      result.push(list[i])
    }
  }
  return result
}

/**
 * 构造树型结构数据
 * @param data 数据源
 * @param id id字段 默认 'id'
 * @param parentId 父节点字段 默认 'parentId'
 * @param children 孩子节点字段 默认 'children'
 * @returns 
 */
export const handleTree = (
  data: TreeNode[],
  id: string = 'id',
  parentId: string = 'parentId',
  children: string = 'children',
): TreeNode[] => {
  const childrenListMap: Record<string | number, TreeNode[]> = {}
  const nodeIds: Record<string | number, TreeNode> = {}
  const tree: TreeNode[] = []

  // 构建 parentId 映射和 nodeId 映射
  for (const item of data) {
    const pid = item[parentId]
    if (!childrenListMap[pid]) {
      childrenListMap[pid] = []
    }
    nodeIds[item[id]] = item
    childrenListMap[pid].push(item)
  }

  // 构建树的根节点
  for (const item of data) {
    const pid = item[parentId]
    if (!nodeIds[pid]) {
      tree.push(item)
    }
  }

  // 递归设置子节点
  function adaptToChildrenList(node: TreeNode): void {
    const childNodes = childrenListMap[node[id]]
    if (childNodes) {
      node[children] = childNodes
      for (const child of childNodes) {
        adaptToChildrenList(child)
      }
    }
  }

  // 为每个根节点递归设置子节点
  for (const rootNode of tree) {
    adaptToChildrenList(rootNode)
  }

  return tree
}

/**
 * const data = [{ id: 1, field: 'id', children = [{ id: 2, field: 'name' }] }] 
 * const result = convertTree(data, (item) => {
 *      return { key: item.id, value: item.field }
 * })
 * result // [{ key: 1, value: 'id', children = [{ key: 2, value: 'name' }] }] 
 * 转换树节点
 * @param data 
 * @param callback 
 * @param childrenName 
 * @returns 
 */
export const convertTree = (
  data: TreeNode[],
  callback: (node: TreeNode) => TreeNode,
  childrenName: string = 'children'
): TreeNode[] => {
  return data.map(item => {
    const transformData = callback(item)
    const childNodes = item[childrenName] || []
    if (childNodes.length > 0) {
      transformData[childrenName] = convertTree(childNodes, callback, childrenName)
    }
    return transformData
  })
}

/**
 * 遍历树节点
 * let result
    foreachTree(data, (item) => {
      if (item.id === 9) {
        result = item
      }
    })
 * @param data 
 * @param callback 
 * @param childrenName 
 */
export const foreachTree = (
  data: TreeNode[],
  callback: (node: TreeNode) => void,
  childrenName: string = 'children'
): void => {
  for (let i = 0; i < data.length; i++) {
    callback(data[i])
    if (data[i][childrenName] && data[i][childrenName].length > 0) {
      foreachTree(data[i][childrenName], callback, childrenName)
    }
  }
}

/**
 * 判断对象是否包含属性名
 * @param target 目标对象
 * @param prop 属性名
 * @returns true or false
 */
export const hasProperty = (target: unknown, prop: string) => {
  return Object.prototype.hasOwnProperty.call(target, prop)
}

/**
 * await-to
 * @param promise Promise 对象
 * @param errorExt 错误信息的扩展
 * @returns 
 */
export const to = <T, E = Error>(promise: Promise<T>, onfinally?: () => void, errorExt?: object): Promise<[E, undefined] | [null, T]> => {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[E, undefined]>((error: E) => {
      if (errorExt) {
        const parsedError = Object.assign({}, error, errorExt)
        return [parsedError, undefined]
      }
      return [error, undefined]
    })
    .finally(onfinally)
}

/**
 * 获取assets文件夹下的文件路径
 * @param url assets下文件的路径
 * @returns 文件路径
 */
export const getAssetsFile = (url: string): string => {
  const path = `../assets${url.startsWith('/') ? url : '/' + url}`
  const modules = import.meta.glob('../assets/**', { eager: true })
  return (modules[path] as { default: string })?.default
}

/**
 * 转换字符串，undefined,null等转化为''
 * @param str 参数
 * @returns 
 */
export const parseStringEmpty = (str: null | undefined | string): string => {
  return str ?? ''
}

/**
 * 获取文件扩展名
 * @param file 文件名字符串，可以是undefined
 * @returns 返回文件的扩展名，如果没有扩展名或输入无效则返回空字符串
 */
export const getFileExtension = (file?: string): string => {
  const index = file?.lastIndexOf('.')
  if (!index || index === -1) {
    return ''
  }
  return (file as string).slice(index + 1)
}

/**
 * 是否为IE浏览器
 * @returns 
 */
export const isIE = (): boolean => {
  return !!window.navigator.userAgent.match(/Trident/)
}

export default null