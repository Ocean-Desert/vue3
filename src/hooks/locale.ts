import { localStorage } from '@/utils/storage'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default () => {
  const i18 = useI18n()
  const currentLocale = computed(() => {
    return i18.locale.value
  })
  const changeLocale = (locale: string) => {
    if (i18.locale.value === locale) return
    i18.locale.value = locale
    localStorage.set('locale', locale)
  }
  return { currentLocale, changeLocale }
}