import type { FetchInstance } from 'ofetch'
import type { FetchOptionsExtend } from '~/types/http'
import 'nuxt/app'

interface API {
  $api: FetchInstance<unknown, FetchOptionsExtend>
  $cancelReq: (abortKey: string, reason?: string) => void
  $cancelAllReq: (reason?: string) => void
  $clearReqCache: (abortKey?: string) => void
  $cancelComponentAllReq: (_componentKey: string, _reason?: string) => void
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    apiPlugin?: ApiPluginConfig
  }
}

declare module 'nuxt/app' {
  interface UseFetchOptions extends FetchOptionsExtend { }

  interface NuxtApp extends API {}
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends API {}
}

export {}
