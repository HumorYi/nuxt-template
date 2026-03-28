export const useLang = (root: string) => (path: string) => useI18n().t(`${root}.${path}`)

export const usePageLang = (path: string) => useLang(`pages.${path}`)

export const useAuthPageLang = (path: string) => usePageLang(`(auth).${path}`)

export const usePermissionPageLang = (path: string) => usePageLang(`(permission).${path}`)

export const useLayoutLang = (path: string) => useLang(`layouts.${path}`)

export const useComponentLang = (path: string) => useLang(`components.${path}`)

export const useCommonLang = () => useLang(`common`)

export const useLoadingLang = () => useLang(`loading`)

export const useSiteLang = () => useLang(`site`)

export const useMessageLang = () => useLang(`message`)

// 业务相关提示文案 S
export const useUserLang = () => useLang(`user`)
// 业务相关提示文案 E


