
const localeZh = import.meta.glob('./*/zh-CN.ts', { eager: true }) as Record<string, LocaleModule>

const mergedLocale = Object.keys(localeZh).reduce((acc, key) => {
  return { ...acc, ...localeZh[key].default }
}, {})

export default {
  'global.name': '陈煌的管理系统',
  'global.load': '加载中',
  'global.rules.message': '{label}不能为空',
  'global.copy.success': '复制成功',
  'global.copy.fail': '您的浏览器不支持剪贴板',
  ...mergedLocale
}