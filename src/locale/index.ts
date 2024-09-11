import { localStorage } from '@/utils/storage'
import { createI18n } from 'vue-i18n'
import en from './lang/en-US'
import cn from './lang/zh-CN'

const defaultLocale = localStorage.get<string>('locale') || 'zh-CN'
export const LOCALE_OPTIONS = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  legacy: false,
  allowComposition: true,
  messages: {
    'en-US': en,
    'zh-CN': cn,
  },
  globalInjection: true // 全局注册$t方法
})

export default i18n