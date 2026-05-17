import type { NitroFetchRequest } from 'nitropack'

import type { UseFetchOptions } from 'nuxt/app'
import type { HttpMethod } from '~/types/http'
import { useFetch, useNuxtApp } from 'nuxt/app'

interface Option { preUrl?: string }

function factory(apiUrlKey: string) {
  function handle(method: HttpMethod = 'GET', option: Option = {}) {
    return async <T = any>(url: NitroFetchRequest, options: UseFetchOptions<T> = {}) => {
      const { $api } = useNuxtApp()
      const baseURL = useRuntimeConfig().public[apiUrlKey]

      const { componentKey } = useApiComponent()

      const { preUrl = '' } = option

      const fullUrl = preUrl + url

      return await useFetch(fullUrl, {
        ...options,
        ...(options.key
          ? {}
          : { key: `unique-request-${Date.now()}-${Math.random()}` }
        ),
        baseURL,
        method,
        $fetch: $api,
        customRequest: { componentKey, ...options.customRequest },
      } as UseFetchOptions<T>)
    }
  }

  return (option: Option = {}) => ({
    get: handle('get', option),
    post: handle('post', option),
    put: handle('put', option),
    del: handle('delete', option),
  })
}

export const useApi = factory('apiUrl')
export const useApiOther = factory('apiOtherUrl')
