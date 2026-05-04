import type { NitroFetchRequest } from 'nitropack'

import type { UseFetchOptions } from 'nuxt/app'
import type { HttpMethod } from '~/types/http'
import { useFetch, useNuxtApp } from 'nuxt/app'

interface Option { preUrl?: string }

function factory(apiBaseKey = 'apiBase', apiUrlKey = 'apiUrl') {
  function handle(method: HttpMethod = 'GET', option: Option = {}) {
    return async <T = any>(url: NitroFetchRequest, options: UseFetchOptions<T> = {}) => {
      const runtimeConfig = useRuntimeConfig()
      const { $api } = useNuxtApp()
      const { componentKey } = useApiComponent()

      const { preUrl = '' } = option

      const baseURL = runtimeConfig.public[import.meta.env.DEV && import.meta.client ? apiBaseKey : apiUrlKey]

      const fullUrl = preUrl + url

      return await useFetch(fullUrl, {
        baseURL,
        ...(options.key
          ? {}
          : { key: `unique-request-${Date.now()}-${Math.random()}` }
        ),
        ...options,
        customRequest: import.meta.client
          ? { componentKey, ...options.customRequest }
          : options.customRequest,
        method,
        $fetch: $api,
      } as UseFetchOptions<T>)
    }
  }

  return (option: Option = {}) => ({
    get: handle('GET', option),
    post: handle('POST', option),
    put: handle('PUT', option),
    del: handle('DELETE', option),
  })
}

export const useApi = factory()
export const useApiOther = factory('apiOtherBase', 'apiOtherUrl')
