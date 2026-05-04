type Lang = (path: string) => string

export function useLang(root: string) {
  const { t } = useI18n()

  return (path: string) => t(`${root}.${path}`)
}

export const useLangPage = (path: string) => useLang(`pages.${path}`)

export const useLangAuthPage = (path: string) => useLangPage(`(auth).${path}`)

export const useLangAuthPermissionPage = (path: string) => useLangAuthPage(`(permission).${path}`)

export const useLangLayout = (path: string) => useLang(`layouts.${path}`)

export const useLangComponent = (path: string) => useLang(`components.${path}`)

export const useLangCommon = () => useLang(`common`)

export const useLangSite = () => useLang(`site`)

export const useLangMessage = () => useLang(`message`)

export const useLangPageMessage = (lang: Lang) => (path: string) => lang(`message.${path}`)

// 业务相关提示文案 S
export const useLangUserPage = () => useLangAuthPermissionPage(`user`)

export const useLangAdminPage = (path: string) => useLangAuthPermissionPage(`(admin).${path}`)
export const useLangFinancePage = (path: string) => useLangAdminPage(`(finance).${path}`)
// 业务相关提示文案 E
