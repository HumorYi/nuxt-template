// 如果需要添加新的 function useLangPageX(path = getCallerFilename())
// vite-plugins/vite-plugin-replace-caller-filename.ts 中添加对应的规则

import { getCallerFilename } from '~/utils/replace-caller-filename'

type Lang = (path: string) => string

export function useLang(root: string) {
  const { t } = useI18n()

  return (path: string) => t(`${root}.${path}`)
}

export const useLangCommon = () => useLang(`common`)

export const useLangSite = () => useLang(`site`)

export const useLangMessage = () => useLang(`message`)

export function useLangPageMessage(lang: Lang) {
  return (path: string) => lang(`message.${path}`)
}

export function useLangPage(path = getCallerFilename()) {
  return useLang(`pages.${path}`)
}

export function useLangAuthPage(path = getCallerFilename()) {
  return useLangPage(`(auth).${path}`)
}

export function useLangAuthPermissionPage(path = getCallerFilename()) {
  return useLangAuthPage(`(permission).${path}`)
}

export function useLangLayout(path = getCallerFilename()) {
  return useLang(`layouts.${path}`)
}

export function useLangComponent(path = getCallerFilename()) {
  return useLang(`components.${path}`)
}

// 业务相关提示文案 S
export function useLangAdminPage(path = getCallerFilename()) {
  return useLangAuthPermissionPage(`(admin).${path}`)
}
export function useLangFinancePage(path = getCallerFilename()) {
  return useLangAdminPage(`(finance).${path}`)
}

export const useLangUserPage = () => useLangAuthPermissionPage(`user`)
// 业务相关提示文案 E
