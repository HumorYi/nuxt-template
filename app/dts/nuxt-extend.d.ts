import type { FetchInstance } from 'ofetch'
import type { ApiPluginConfig, FetchOptionsExtend } from '~/types/http'
import 'nuxt/app'

interface API {
  $api: FetchInstance<unknown, FetchOptionsExtend>
  $cancelRequest: () => void
  $cancelAllRequest: () => void
  $clearRequestCache: () => void
  $cancelComponentRequests: (_componentKey: string, _reason?: string) => void
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    apiPlugin?: ApiPluginConfig
  }
}

declare module 'nuxt/app' {
  interface UseFetchOptions extends FetchOptionsExtend { }

  type NuxtApp = API
}

declare module '@vue/runtime-core' {
  type ComponentCustomProperties = API
}

export {}
