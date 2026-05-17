import type { FetchError } from 'ofetch'
import type {
  ApiInstanceConfig,
  ApiPluginConfig,
  CustomCacheConfig,
  CustomGlobalCacheConfig,
  CustomRequestConfig,
  CustomRetryConfig,
  CustomToastConfig,
  FetchOptionConfig,
  FetchOptionsExtend,
  HttpMethod,
  RequestCacheItem,
  RequestMeta,
} from '~/types/http'

type Timer = NodeJS.Timeout | null

const customCacheConfig: CustomGlobalCacheConfig = {
  enable: false,
  ttl: 5 * 60 * 1000,
  maxSize: 100,
}

const customRetryConfig: CustomRetryConfig = {
  maxCount: 0,
  baseDelay: 1 * 1000,
  maxDelay: 10 * 1000,
}

const customRequestConfig: CustomRequestConfig = {
  timeout: 10 * 1000,
  token: true,
  serializeForm: true,
  headers: {
    contentType: 'application/json;charset=utf-8',
    token: 'Authorization',
    csrfToken: 'X-CSRF-Token',
  },
}

const customToastConfig: CustomToastConfig = {
  timeout: 'error.timeout',
  networkError: 'error.networkError',
  tokenExpired: 'error.tokenExpired',
  tokenRefreshFailed: 'error.tokenRefreshFailed',
  serverError: 'error.serverError',
}

const fetchOptionConfig: FetchOptionConfig = {
  credentials: 'include',
  responseType: 'json',
}

function syncApiConfig(apiPluginConfig: ApiPluginConfig) {
  Object.assign(customCacheConfig, apiPluginConfig.customCache || {})
  Object.assign(customRetryConfig, apiPluginConfig.customRetry || {})
  Object.assign(customRequestConfig, apiPluginConfig.customRequest || {})
  Object.assign(customToastConfig, apiPluginConfig.customToast || {})

  const keys = Object.keys(fetchOptionConfig) as (keyof FetchOptionConfig)[]
  keys.forEach((key) => {
    const configVal = apiPluginConfig[key] as unknown
    if (configVal) {
      (fetchOptionConfig as Record<string, unknown>)[key] = configVal
    }
  })
}

function objectHash(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return String(obj)
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(objectHash).join(',')}]`
  }

  let hash = ''

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    hash += `${key}:${objectHash(value)};`
  }

  return hash
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {}

  if (headers) {
    try {
      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          normalized[key] = value
        })
      }
      else if (Array.isArray(headers)) {
        headers.forEach(([key, value]) => {
          normalized[key] = String(value)
        })
      }
      else {
        Object.entries(headers).forEach(([key, value]) => {
          normalized[key] = String(value)
        })
      }
    }
    catch (e) {
      console.error('[API] 标准化Headers失败', e)
    }
  }

  return normalized
}

const getCsrfToken = (() => {
  let csrfToken: string | undefined

  return () => {
    if (import.meta.server) {
      return
    }

    if (!csrfToken) {
      const el = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement

      csrfToken = el?.content
    }

    return csrfToken
  }
})()

let toastFn: (msg: string) => void = (msg) => {
  console.log(`[提示] ${msg}`)
}

export function registerApiToast(fn: (msg: string) => void): void {
  toastFn = fn
}

function translateMessage(msg: string, i18n?: any): string {
  if (!i18n) {
    return msg
  }

  try {
    const translated = i18n.t(msg)

    return translated !== msg ? translated : msg
  }
  catch {
    return msg
  }
}

function generateAbortKey(
  baseURL: string,
  url: string,
  method: HttpMethod,
  options: FetchOptionsExtend,
): string {
  try {
    return objectHash({
      baseURL,
      url,
      method,
      body: options.body,
      query: options.query,
    })
  }
  catch (e) {
    console.error('[API] 生成AbortKey失败', e)

    return `${baseURL}_${url}_${method}`
  }
}

function generateCacheKey(
  baseURL: string,
  url: string,
  method: HttpMethod,
  options: FetchOptionsExtend,
): string {
  const key = `${baseURL}_${url}_${method.toUpperCase()}`

  try {
    return options.query ? `${key}_${objectHash(options.query)}` : key
  }
  catch (e) {
    console.error('[API] 生成CacheKey失败', e)
    return `${key}_${Date.now()}`
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n as any
  const { apiPlugin } = useRuntimeConfig().public

  if (apiPlugin) {
    syncApiConfig(apiPlugin)
  }

  const authStore = useAuthStore()
  const loadingStore = useLoadingStore()

  const requestCache = useState<Record<string, RequestCacheItem>>(
    'request_cache',
    () => ({}),
  )

  const abortStateMap = new Map<
    string,
    {
      abortController: AbortController
      inFlightRequest: { promise: Promise<unknown>, createTime: number }
      componentKey?: string
      loadingKey?: string
    }
  >()

  const loadingMap = new Map<string, number>()

  function startLoading(loadingKey: string) {
    const val = (loadingMap.get(loadingKey) || 0) + 1

    loadingStore.open(loadingKey)

    loadingMap.set(loadingKey, val)
  }

  function stopLoading(loadingKey: string) {
    if (!loadingMap.has(loadingKey))
      return

    const val = (loadingMap.get(loadingKey) || 0) - 1

    if (val === 0) {
      loadingStore.close(loadingKey)

      loadingMap.delete(loadingKey)
    }
    else {
      loadingMap.set(loadingKey, val)
    }
  }

  function clearRequest(abortKey: string, loadingKey: string): void {
    stopLoading(loadingKey)

    abortStateMap.delete(abortKey)
  }

  function cancelReq(abortKey: string, reason = ''): void {
    const abortState = abortStateMap.get(abortKey)

    if (!abortState) {
      return
    }

    abortState.abortController.abort(`${reason} canceled`)

    clearRequest(abortKey, abortState.loadingKey || '')
  }

  function cancelAllReq(reason = '路由跳转'): void {
    abortStateMap.forEach((val, abortKey) => cancelReq(abortKey, reason))
  }

  function cancelComponentAllReq(
    componentKey: string,
    reason = '组件销毁',
  ): void {
    abortStateMap.forEach((val, abortKey) => {
      if (componentKey && componentKey === val.componentKey) {
        cancelReq(abortKey, reason)
      }
    })
  }

  function clearReqCache(key?: string): void {
    if (key) {
      const { [key]: _, ...newCache } = requestCache.value
      requestCache.value = newCache
    }
    else {
      requestCache.value = {}
    }
  }

  function cleanExpiredCache(): void {
    if (!customCacheConfig.maxSize) {
      return
    }

    const now = Date.now()
    const currentCache = { ...requestCache.value }

    const validCache = Object.entries(currentCache).reduce(
      (acc, [key, item]) => {
        if (item.expireTime >= now) {
          acc[key] = item
        }

        return acc
      },
      {} as typeof currentCache,
    )

    const cacheKeys = Object.keys(validCache)

    if (cacheKeys.length <= customCacheConfig.maxSize) {
      requestCache.value = validCache
      return
    }

    const sortedKeys = cacheKeys.sort((a, b) => {
      const timeA = validCache[a]?.lastAccessTime ?? 0
      const timeB = validCache[b]?.lastAccessTime ?? 0

      return timeB - timeA
    })

    const finalCache = sortedKeys.slice(0, customCacheConfig.maxSize).reduce(
      (acc, key) => {
        const cacheItem = validCache[key]
        if (cacheItem) {
          acc[key] = cacheItem
        }

        return acc
      },
      {} as Record<string, RequestCacheItem>,
    )

    requestCache.value = finalCache
  }

  async function handleRequestError(
    error: unknown,
    requestMeta: RequestMeta,
    apiConfig: ApiInstanceConfig,
    options: FetchOptionsExtend,
  ): Promise<never> {
    const fetchError = error as FetchError
    const { message, status, data } = fetchError

    const lastCustomToastConfig: CustomToastConfig = {
      ...customToastConfig,
      ...apiConfig.customToast,
      ...options.customToast,
    }

    let errorMsg: string | undefined = message

    if (message.includes('tokenRefreshFailed')) {
      errorMsg = lastCustomToastConfig.tokenRefreshFailed
    }
    else if (message.includes('timeout')) {
      errorMsg = lastCustomToastConfig.timeout
    }
    else if (message.endsWith('canceled')) {
      throw error
    }

    if (!status) {
      errorMsg = lastCustomToastConfig.networkError
    }
    else if (status === 401) {
      errorMsg = lastCustomToastConfig.tokenExpired
    }
    else if (status >= 500) {
      errorMsg = lastCustomToastConfig.serverError
    }
    else if (data.success === false) {
      errorMsg = data.message
    }

    const err = new Error(errorMsg, { cause: fetchError })

    try {
      await apiConfig.hooks?.onError?.(requestMeta, err)
    }
    catch (e) {
      console.error('[API] 错误处理失败', e)
      errorMsg = lastCustomToastConfig.requestError
    }
    finally {
      if (import.meta.client) {
        toastFn(translateMessage(errorMsg || '', i18n))
      }
    }

    throw err
  }

  class TokenRefreshManager {
    private refreshing = false

    private waiters: Array<{
      resolve: (value: boolean) => void
      reject: (reason: Error) => void
    }> = []

    get isRefreshing() {
      return this.refreshing
    }

    async waitForRefresh(): Promise<boolean> {
      if (!this.refreshing) {
        return true
      }

      return new Promise((resolve, reject) => {
        this.waiters.push({ resolve, reject })
      })
    }

    async doRefresh(): Promise<boolean> {
      if (this.refreshing) {
        return this.waitForRefresh()
      }

      this.refreshing = true

      try {
        const newToken = await authStore.getRefreshToken()

        if (!newToken) {
          throw new Error('tokenRefreshFailed')
        }

        this.refreshing = false
        const waiters = [...this.waiters]
        this.waiters = []
        waiters.forEach(w => w.resolve(true))

        return true
      }
      catch (err) {
        this.refreshing = false

        const error = new Error(customToastConfig.tokenExpired, { cause: err })
        const waiters = [...this.waiters]
        this.waiters = []
        waiters.forEach(w => w.reject(error))

        authStore.clear()

        if (import.meta.client) {
          await nuxtApp.runWithContext(() => authStore.toLogin())
        }

        throw error
      }
    }
  }

  const tokenRefreshManager = new TokenRefreshManager()

  async function retryRequest<T>({
    abortKey,
    apiConfig,
    options,
    fetchFn,
    retry = 0,
    timeout = undefined,
    isAfterRefresh = false,
  }: {
    abortKey: string
    apiConfig: ApiInstanceConfig
    options: FetchOptionsExtend
    fetchFn: () => Promise<T>
    retry?: number
    timeout?: number
    isAfterRefresh?: boolean
  }): Promise<T> {
    const lastCustomRequestConfig: CustomRequestConfig = {
      ...customRequestConfig,
      ...apiConfig.customRequest,
      ...options.customRequest,
    }
    const lastCustomRetryConfig: CustomRetryConfig = {
      ...customRetryConfig,
      ...apiConfig.customRetry,
      ...options.customRetry,
    }

    timeout ??= lastCustomRequestConfig.timeout || 0
    let timer: Timer = null

    try {
      if (tokenRefreshManager.isRefreshing && lastCustomRequestConfig.token) {
        const refreshSuccess = await tokenRefreshManager.waitForRefresh()

        if (!refreshSuccess) {
          throw new Error('tokenRefreshFailed')
        }

        return retryRequest({ abortKey, apiConfig, options, fetchFn, retry, isAfterRefresh: true })
      }

      timer = setTimeout(() => {
        const abortState = abortStateMap.get(abortKey)

        if (abortState) {
          abortState.abortController.abort('timeout')
          abortState.abortController = new AbortController()
        }

        timer && clearTimeout(timer)
      }, timeout)

      const res = await fetchFn()

      timer && clearTimeout(timer)

      return res
    }
    catch (error) {
      timer && clearTimeout(timer)

      const fetchError = error as FetchError

      if (
        fetchError.message?.includes('timeout')
        && lastCustomRetryConfig.maxCount
        && retry < lastCustomRetryConfig.maxCount
      ) {
        const delay = Math.min(
          (lastCustomRetryConfig.baseDelay ?? 0) * 2 ** retry * (0.8 + Math.random() * 0.4),
          lastCustomRetryConfig.maxDelay ?? 0,
        )

        return retryRequest({
          abortKey,
          apiConfig,
          options,
          fetchFn,
          retry: retry + 1,
          timeout: timeout + delay,
          isAfterRefresh,
        })
      }

      if (fetchError.status !== 401 || isAfterRefresh) {
        throw error
      }

      if (tokenRefreshManager.isRefreshing) {
        const refreshSuccess = await tokenRefreshManager.waitForRefresh()

        if (!refreshSuccess) {
          throw new Error('tokenRefreshFailed')
        }
      }
      else {
        await tokenRefreshManager.doRefresh()
      }

      return retryRequest({ abortKey, apiConfig, options, fetchFn, retry, isAfterRefresh: true })
    }
  }

  async function processRequestOptions(
    fullUrl: string,
    apiConfig: ApiInstanceConfig,
    options: FetchOptionsExtend,
  ): Promise<FetchOptionsExtend> {
    try {
      const token = authStore.getToken()
      const csrfToken = getCsrfToken()
      const normalizedHeaders = normalizeHeaders(options.headers)
      const lastHeaders = {
        ...customRequestConfig.headers,
        ...apiConfig.customRequest?.headers,
        normalizedHeaders,
      }
      const lastCustomRequestConfig: CustomRequestConfig = {
        ...customRequestConfig,
        ...apiConfig.customRequest,
        ...options.customRequest,
      }

      if (!normalizedHeaders['Content-Type'] && lastHeaders.contentType) {
        normalizedHeaders['Content-Type'] = lastHeaders.contentType
      }

      if (csrfToken && lastHeaders.csrfToken) {
        normalizedHeaders[lastHeaders.csrfToken] = csrfToken
      }

      if (token && lastCustomRequestConfig.token && lastHeaders.token) {
        normalizedHeaders[lastHeaders.token] = `Bearer ${token}`
      }

      const processedOptions: FetchOptionsExtend = {
        ...fetchOptionConfig,
        ...apiConfig,
        ...options,
        headers: normalizedHeaders,
      }

      if (
        lastCustomRequestConfig.serializeForm
        && processedOptions.body instanceof FormData
      ) {
        processedOptions.body = Object.fromEntries(processedOptions.body.entries())
      }

      await apiConfig.hooks?.beforeRequest?.({
        url: fullUrl,
        method: options.method || 'get',
        query: options.query,
        body: options.body,
      }, processedOptions)

      return processedOptions
    }
    catch (e) {
      console.error('[API] 处理请求配置失败', e)
      return options
    }
  }

  function createApiClient(apiConfig: ApiInstanceConfig = {}) {
    const fetchInstance = $fetch.create({})

    return async <T>(
      url: string,
      options: FetchOptionsExtend,
    ): Promise<T> => {
      const { baseURL = '' } = options
      const fullUrl = `${baseURL}${url}`
      const lastCustomRequestConfig: CustomRequestConfig = {
        ...customRequestConfig,
        ...apiConfig.customRequest,
        ...options.customRequest,
      }
      const method = (options.method?.toLowerCase() || 'get') as HttpMethod

      const {
        componentKey,
        loadingKey = 'global',
        abortKey = generateAbortKey(baseURL, url, method, options),
      } = lastCustomRequestConfig

      const requestMeta: RequestMeta = {
        url: fullUrl,
        method,
        query: options.query,
        body: options.body,
      }

      const inFlightRequest = abortStateMap.get(abortKey)?.inFlightRequest
      if (inFlightRequest) {
        return inFlightRequest.promise as T
      }

      const lastCustomCacheConfig: CustomCacheConfig = {
        ...customCacheConfig,
        ...apiConfig.customCache,
        ...options.customCache,
      }
      let cacheKey = ''

      if (lastCustomCacheConfig.enable) {
        cacheKey = generateCacheKey(baseURL, url, method, options)

        const cacheItem = requestCache.value[cacheKey]
        const now = Date.now()

        if (cacheItem) {
          if (cacheItem.expireTime >= now) {
            cacheItem.lastAccessTime = now
            requestCache.value[cacheKey] = cacheItem

            return cacheItem.data as T
          }
          else {
            cleanExpiredCache()
          }
        }
      }

      const abortController = new AbortController()

      const requestPromise = (async (): Promise<T> => {
        try {
          const response = await retryRequest({
            abortKey,
            apiConfig,
            options,
            fetchFn: async () => {
              const processedOptions = await processRequestOptions(fullUrl, apiConfig, options)

              return fetchInstance<T>(url, {
                ...processedOptions,
                signal: abortController.signal,
              })
            },
          })

          await apiConfig.hooks?.afterResponse?.(requestMeta, response)

          if (
            lastCustomCacheConfig.enable
            && lastCustomCacheConfig.ttl
            && cacheKey
            && response
          ) {
            const now = Date.now()

            requestCache.value[cacheKey] = {
              data: response,
              expireTime: now + lastCustomCacheConfig.ttl,
              lastAccessTime: now,
            }
          }
          return response as T
        }
        catch (error) {
          throw await handleRequestError(error, requestMeta, apiConfig, options)
        }
        finally {
          clearRequest(abortKey, loadingKey)
        }
      })()

      abortStateMap.set(abortKey, {
        abortController,
        inFlightRequest: { promise: requestPromise, createTime: Date.now() },
        componentKey,
        loadingKey,
      })

      startLoading(loadingKey)

      return requestPromise
    }
  }

  if (import.meta.client) {
    window.addEventListener('beforeunload', () => {
      cancelAllReq('页面卸载，取消请求')
    })
  }

  return {
    provide: {
      api: createApiClient(),
      cancelReq,
      cancelAllReq,
      cancelComponentAllReq,
      clearReqCache,
    },
  }
})
