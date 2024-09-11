import localeGlobal from './global/en-US'
const localeEn = import.meta.glob('@/views/**/en-US.ts', { eager: true }) as Record<string, LocaleModule>

const mergedLocale = Object.keys(localeEn).reduce((acc, key) => {
  return { ...acc, ...localeEn[key].default }
}, {})


export default {
  ...localeGlobal,
  ...mergedLocale,
}