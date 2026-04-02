type Lang = (path: string) => string

export function useLang(root: string) {
  const { t } = useI18n()

  return (path: string) => t(`${root}.${path}`)
}

export const usePageLang = (path: string) => useLang(`pages.${path}`)

export const useAuthPageLang = (path: string) => usePageLang(`(auth).${path}`)

export const usePermissionPageLang = (path: string) => useAuthPageLang(`(permission).${path}`)

export const useLayoutLang = (path: string) => useLang(`layouts.${path}`)

export const useComponentLang = (path: string) => useLang(`components.${path}`)

export const useCommonLang = () => useLang(`common`)

export const useLoadingLang = () => useLang(`loading`)

export const useSiteLang = () => useLang(`site`)

export const useMessageLang = () => useLang(`message`)

export const usePageMessageLang = (lang: Lang) => (path: string) => lang(`message.${path}`)

// 业务相关提示文案 S
export const useUserLang = () => usePermissionPageLang(`user`)

export const useAdminPageLang = (path: string) => usePermissionPageLang(`(admin).${path}`)
export const useFinancePageLang = (path: string) => useAdminPageLang(`(finance).${path}`)
// 业务相关提示文案 E
