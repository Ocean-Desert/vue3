const convert = {
  convertToTarget<T, S extends Record<string, any>>(source: S): T {
    const result = {} as T
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (key in result) {
          result[key] = source[key]
        }
      }
    }
    return result
  }
}

export const convertBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const exp = Math.floor(Math.log(bytes) / Math.log(1024))
  const unit = 'KMGTPE'.charAt(exp - 1)
  return `${(bytes / Math.pow(1024, exp)).toFixed(1)} ${unit}B`
}

export const convertPercentage = (part: number, total: number): string => {
  if (total === 0) {
    return '0%'
  }
  const percentage: number = (part / total) * 100
  return percentage.toFixed(2) + '%'
}

export default convert