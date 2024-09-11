import localeGlobal from './global/zh-CN'
const localeZh = import.meta.glob('@/views/**/zh-CN.ts', { eager: true }) as Record<string, LocaleModule>

const mergedLocale = Object.keys(localeZh).reduce((acc, key) => {
  return { ...acc, ...localeZh[key].default }
}, {})

export default {
  ...localeGlobal,
  ...mergedLocale,
}