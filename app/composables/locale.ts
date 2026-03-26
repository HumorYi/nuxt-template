export function useLocale() {
  return useState<string>('locale', () => useLocaleDefault().value)
}

export function useLocaleDefault(fallback = 'zh-CN') {
  const locale = ref(fallback)

  if (import.meta.server) {
    const reqLocale = useRequestHeaders()['accept-language']?.split(',')[0]

    if (reqLocale) {
      locale.value = reqLocale
    }
  }
  else if (import.meta.client) {
    const navLang = navigator.language

    if (navLang) {
      locale.value = navLang
    }
  }

  return locale
}

export function useLocales() {
  const locale = useLocale()
  const locales = ref([
    'zh-CN',
    'en-US',
    'en-GB',
    // ...,
    'ja-JP-u-ca-japanese',
  ])

  if (!locales.value.includes(locale.value)) {
    locales.value.unshift(locale.value)
  }

  return locales
}

export function useLocaleDate(date: Ref<Date> | Date, locale = useLocale()) {
  return computed(() =>
    new Intl.DateTimeFormat(locale.value, { dateStyle: 'full' }).format(
      unref(date),
    ),
  )
}
