const localeEn = import.meta.glob('./*/en-US.ts', { eager: true }) as Record<string, LocaleModule>

const mergedLocale = Object.keys(localeEn).reduce((acc, key) => {
  return { ...acc, ...localeEn[key].default }
}, {})


export default {
  'global.name': `Chen Huang management system`,
  'global.load': 'Loding',
  'global.rules.message': '{label} cannot be empty',
  'global.copy.success': 'Copy success',
  'global.copy.fail': 'Your browser does not support clipboard',
   ...mergedLocale,
}