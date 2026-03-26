import type { NitroFetchRequest } from 'nitropack'

import type { UseFetchOptions } from 'nuxt/app'
import type { HttpMethod } from '~/types/api'
import { useFetch, useNuxtApp } from 'nuxt/app'

interface Option { preUrl?: string }

function factory(apiBaseKey = 'apiBase', apiUrlKey = 'apiUrl') {
  function handle(method: HttpMethod = 'GET', option: Option = {}) {
    return async <T>(url: NitroFetchRequest, options: UseFetchOptions<T> = {}) => {
      const runtimeConfig = useRuntimeConfig()
      const { $api } = useNuxtApp()
      const { componentKey } = useApiComponent()

      const { preUrl = '' } = option

      const baseURL = runtimeConfig.public[import.meta.env.DEV ? apiBaseKey : apiUrlKey]

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
      })
    }
  }

  return (optoin: Option = {}) => ({
    get: handle('GET', optoin),
    post: handle('POST', optoin),
    put: handle('PUT', optoin),
    del: handle('DELETE', optoin),
  })
}

export const useApi = factory()
export const useApiOther = factory('apiOtherBase', 'apiOtherUrl')
