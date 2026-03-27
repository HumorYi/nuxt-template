import type { FetchError } from 'ofetch'
import type {
  ApiInstanceConfig,
  ApiPluginConfig,
  CustomCacheConfig,
  CustomGlobalCacheConfig,
  CustomLoadingConfig,
  CustomRequestConfig,
  CustomRetryConfig,
  CustomToastConfig,
  ErrorResponse,
  FetchOptionConfig,
  FetchOptionsExtend,
  HttpMethod,
  RequestCacheItem,
  RequestMeta,
} from '~/types/api'

// ========================= 全局默认配置 =========================
/**
 * Loading 全局默认配置
 */
const customLoadingConfig: CustomLoadingConfig = {
  enable: false,
  key: 'global',
}

/**
 * 缓存全局默认配置
 */
const customCacheConfig: CustomGlobalCacheConfig = {
  enable: false,
  ttl: 5 * 60 * 1000,
  methods: ['GET'],
  keyPrefix: 'api_cache_',
  maxSize: 100,
  cleanInterval: 5 * 60 * 1000,
}

/**
 * 请求重试全局默认配置
 */
const customRetryConfig: CustomRetryConfig = {
  maxCount: 0,
  baseDelay: 1000,
  maxDelay: 10 * 1000,
}

/**
 * 请求基础全局默认配置
 */
const customRequestConfig: CustomRequestConfig = {
  timeout: 10 * 1000,
  withToken: true,
  serializeForm: true,
  abortKeyPrefix: 'api_abort_',
  headers: {
    contentType: 'application/json;charset=utf-8',
    token: 'Authorization',
    csrfToken: 'X-CSRF-Token',
  },
}

/**
 * 错误提示全局默认配置
 */
const customToastConfig: CustomToastConfig = {
  timeout: 'error.timeout',
  networkError: 'error.networkError',
  tokenExpired: 'auth.tokenExpired',
  noPermission: 'auth.noPermission',
  serverError: 'error.serverError',
  configError: 'error.configError',
  duplicateRequest: 'error.duplicateRequest',
  businessError: 'error.businessError',
  csrfError: 'error.csrfError',
  emptyToken: 'error.emptyToken',
}

/**
 * ofetch 基础请求配置
 */
const fetchOptionConfig: FetchOptionConfig = {
  credentials: 'include',
  responseType: 'json',
}

/**
 * 定时器类型定义
 */
type Timer = ReturnType<typeof setTimeout> | null

// ========================= 工具函数 =========================
/**
 * 生成对象哈希值（用于生成唯一缓存/取消键）
 * @param obj 任意对象
 * @returns 哈希字符串
 */
function objectHash(obj: unknown): string {
  if (obj === null || typeof obj !== 'object')
    return String(obj)

  if (Array.isArray(obj))
    return `[${obj.map(objectHash).join(',')}]`

  let hash = ''

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    hash += `${key}:${objectHash(value)};`
  }
  return hash
}

/**
 * 标准化请求头（统一格式）
 * @param headers 原始请求头
 * @returns 标准化后的请求头对象
 */
function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {}
  if (!headers)
    return normalized

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
  return normalized
}

/**
 * 获取 CSRF Token（单例模式，避免重复查询DOM）
 * @returns csrfToken
 */
const getCsrfToken = (() => {
  let csrfToken: string | null = null
  return (): string | null => {
    // 服务端直接返回null
    if (import.meta.server)
      return null
    // 缓存已获取的token
    if (csrfToken)
      return csrfToken
    // 从meta标签获取token
    const el = document.querySelector('meta[name="csrf-token"]')
    csrfToken = (el as HTMLMetaElement)?.content || null
    return csrfToken
  }
})()

/**
 * 全局提示函数（支持外部注册自定义提示）
 */
let toastFn: (_msg: string) => void = (msg) => {
  console.log(`[提示] ${msg}`)
}

/**
 * 注册自定义提示组件
 * @param fn 提示函数
 */
export function registerApiToast(fn: (_msg: string) => void): void {
  toastFn = fn
}

/**
 * 翻译提示消息（支持 i18n 翻译键）
 * @param msg 消息内容或翻译键
 * @param i18n i18n 实例（可选）
 * @returns 翻译后的消息
 */
function translateMessage(msg: string, i18n?: any): string {
  if (!i18n)
    return msg

  try {
    const translated = i18n.t(msg)
    return translated !== msg ? translated : msg
  }
  catch {
    return msg
  }
}

/**
 * 请求日志模板
 */
const logTemplate = {
  error: null,
  query: null,
  body: null,
  time: '',
  type: '' as 'request' | 'response' | 'error',
  method: '',
  url: '',
  status: 0,
  data: null,
  duration: 0,
}

/**
 * 控制台请求日志打印（仅开发环境+客户端）
 * @param type 日志类型
 * @param meta 请求元数据
 * @param extra 额外信息
 */
function logRequest(
  type: 'request' | 'response' | 'error',
  meta: RequestMeta,
  extra?: {
    status?: number
    data?: unknown
    error?: unknown
    duration?: number
  },
): void {
  if (!import.meta.env.DEV || !import.meta.client)
    return

  try {
    const timestamp = new Date().toLocaleTimeString()
    const colorMap = {
      request: '#4299e1',
      response: '#48bb78',
      error: '#e53e3e',
    }
    const logData = Object.assign(logTemplate, {
      time: timestamp,
      type,
      url: meta.url,
      method: meta.method,
      query: JSON.stringify(meta.query),
      body: JSON.stringify(meta.body),
      ...extra,
    })
    console[type === 'error' ? 'error' : 'log'](
      `[%cAPI ${type} ${timestamp}]`,
      `color:${colorMap[type]};font-weight:500`,
      logData,
    )
  }
  catch (e) {
    console.error('[API] 打印日志失败', e)
  }
}

/**
 * 同步运行时配置到全局配置
 * @param apiPluginConfig 运行时配置
 */
function syncApiConfig(apiPluginConfig: ApiPluginConfig) {
  Object.assign(customLoadingConfig, apiPluginConfig.customLoading || {})
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

/**
 * 生成请求取消唯一键
 * @param baseURL 基础地址
 * @param url 请求地址
 * @param method 请求方法
 * @param options 请求配置
 * @param apiConfig 实例配置
 * @returns 唯一取消键
 */
function generateAbortKey(
  baseURL: string,
  url: string,
  method: HttpMethod,
  options: FetchOptionsExtend,
  apiConfig: ApiInstanceConfig,
): string {
  const { abortKeyPrefix }: CustomRequestConfig = {
    ...customRequestConfig,
    ...apiConfig.customRequest,
    ...options.customRequest,
  }

  try {
    const lastHeaders: Record<string, unknown> = {
      ...customRequestConfig.headers,
      ...apiConfig.customRequest?.headers,
      ...options.headers,
    }
    // 排除token、csrfToken，避免影响唯一键生成
    const excludes = ['token', 'csrfToken'].map(key => lastHeaders[key] || '')

    const requestKey = {
      baseURL,
      url,
      method: method.toUpperCase(),
      body: options.body,
      query: options.query,
      headers: Object.entries(options.headers || {})
        .filter(([k]) => !excludes.includes(k))
        .reduce((o, [k, v]) => ({ ...o, [k]: v }), {}),
    }

    return `${abortKeyPrefix}${objectHash(requestKey)}`
  }
  catch (e) {
    console.error('[API] 生成AbortKey失败', e)
    return `${abortKeyPrefix}${baseURL}_${url}_${method}_${Date.now()}`
  }
}

/**
 * 生成缓存唯一键
 * @param baseURL 基础地址
 * @param url 请求地址
 * @param method 请求方法
 * @param options 请求配置
 * @param keyPrefix 缓存前缀
 * @returns 唯一缓存键
 */
function generateCacheKey(
  baseURL: string,
  url: string,
  method: HttpMethod,
  options: FetchOptionsExtend,
  keyPrefix: string,
): string {
  const key = `${keyPrefix}${baseURL}_${url}_${method.toUpperCase()}`
  try {
    return options.query ? `${key}_${objectHash(options.query)}` : key
  }
  catch (e) {
    console.error('[API] 生成CacheKey失败', e)
    return `${key}_${Date.now()}`
  }
}

// ========================= Nuxt API 插件主入口 =========================
export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const { apiPlugin } = runtimeConfig.public
  if (apiPlugin)
    syncApiConfig(apiPlugin)

  const authStore = useAuthStore()
  const i18n = nuxtApp.$i18n as any
  const requestCache = useState<Record<string, RequestCacheItem>>(
    'request_cache',
    () => ({}),
  )

  /**
   * 请求取消控制器Map：存储所有正在进行的请求
   * key: abortKey
   * value: 控制器+请求信息
   */
  const abortStateMap = new Map<
    string,
    {
      abortController: AbortController
      inFlightRequest: { promise: Promise<unknown>, createTime: number }
      componentKey?: string
      loadingKey?: string
    }
  >()

  const loadingStore = useLoadingStore()

  // 定时器
  let cacheCleanTimer: Timer = null
  let flightRequestCleanTimer: Timer = null

  // ========================= Loading 状态管理 =========================
  /**
   * 开启Loading（计数模式，避免重复开关）
   * @param key 取消键
   */
  const incrLoading = (key: string) => {
    if (!import.meta.client) {
      return
    }

    const abortState = abortStateMap.get(key)

    if (!abortState?.loadingKey) {
      return
    }

    let count = 0
    abortStateMap.forEach((state) => {
      if (state.loadingKey === abortState.loadingKey) {
        count++
      }
    })

    // 首次请求时开启loading
    if (count === 1) {
      loadingStore.open(abortState.loadingKey)
    }
  }

  /**
   * 关闭Loading
   * @param key 取消键
   */
  const decrLoading = (key: string) => {
    if (!import.meta.client) {
      return
    }

    const abortState = abortStateMap.get(key)
    if (!abortState?.loadingKey) {
      return
    }

    let count = 0

    abortStateMap.forEach((state) => {
      if (state.loadingKey === abortState.loadingKey) {
        count++
      }
    })

    // 最后一个请求完成时关闭loading
    if (count === 1) {
      loadingStore.close(abortState.loadingKey)
    }

    abortState.loadingKey = undefined
  }

  // ========================= 请求清理/取消 =========================
  /**
   * 清理单个请求（关闭loading+移除控制器）
   * @param key 取消键
   */
  const clearRequest = (key: string): void => {
    decrLoading(key)
    abortStateMap.delete(key)
  }

  /**
   * 取消单个请求
   * @param key 取消键
   * @param reason 取消原因
   */
  const cancelRequest = (key: string, reason = ''): void => {
    const abortState = abortStateMap.get(key)
    if (!abortState) {
      return
    }
    abortState.abortController.abort(`${reason} canceled`)
    clearRequest(key)
  }

  /**
   * 取消所有请求
   * @param reason 取消原因
   */
  const cancelAllRequest = (reason = '路由跳转'): void => {
    abortStateMap.forEach((val, key) => cancelRequest(key, reason))
  }

  /**
   * 取消指定组件的所有请求（组件销毁时调用）
   * @param componentKey 组件标识
   * @param reason 取消原因
   */
  const cancelComponentRequests = (
    componentKey: string,
    reason = '组件销毁',
  ): void => {
    abortStateMap.forEach((val, key) => {
      if (componentKey && componentKey === val.componentKey) {
        cancelRequest(key, reason)
      }
    })
  }

  /**
   * 清理超时请求（30秒未完成自动取消）
   */
  const cleanExpiredFlightRequests = (): void => {
    const expireTime = Date.now() - 30 * 1000
    abortStateMap.forEach(({ inFlightRequest }, key) => {
      if (expireTime > inFlightRequest.createTime) {
        cancelRequest(key, '请求超时，自动取消')
      }
    })
  }

  // ========================= 缓存管理 =========================
  /**
   * 清理缓存（单个/全部）
   * @param key 缓存键（可选）
   */
  const clearRequestCache = (key?: string): void => {
    if (key) {
      const { [key]: _, ...newCache } = requestCache.value
      requestCache.value = newCache
    }
    else {
      requestCache.value = {}
    }
  }

  /**
   * 清理所有缓存定时器
   */
  const cleanCacheTimer = (): void => {
    if (cacheCleanTimer) {
      clearInterval(cacheCleanTimer)
    }

    if (flightRequestCleanTimer) {
      clearInterval(flightRequestCleanTimer)
    }

    cacheCleanTimer = null
    flightRequestCleanTimer = null
  }

  /**
   * 清理过期缓存+LRU淘汰（超出最大数量时删除最久未使用）
   */
  const cleanExpiredCache = (): void => {
    if (!customCacheConfig.maxSize) {
      return
    }

    const now = Date.now()
    const currentCache = { ...requestCache.value }

    // 过滤未过期缓存
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

    // LRU：按最后访问时间排序，保留最新的
    const sortedKeys = cacheKeys.sort((a, b) => {
      const timeA = validCache[a]?.lastAccessTime ?? 0
      const timeB = validCache[b]?.lastAccessTime ?? 0

      return timeB - timeA
    })

    // 保留指定数量的缓存
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

  // ========================= 统一错误处理 =========================
  /**
   * 请求错误统一处理
   * @param error 错误对象
   * @param requestMeta 请求元数据
   * @param apiConfig 实例配置
   * @param options 请求配置
   */
  const handleRequestError = async (
    error: unknown,
    requestMeta: RequestMeta,
    apiConfig: ApiInstanceConfig,
    options: FetchOptionsExtend,
  ): Promise<never> => {
    const fetchError = error as FetchError
    const { message, status, data } = fetchError
    // 合并配置优先级：全局 < 实例 < 单次请求
    const lastCustomToastConfig: CustomToastConfig = {
      ...customToastConfig,
      ...apiConfig.customToast,
      ...options.customToast,
    }

    let errorMsg: string | undefined
    logRequest('error', requestMeta, {
      data,
      status,
      error: message,
    })

    // 错误类型匹配
    if (message.includes('timeout')) {
      errorMsg = lastCustomToastConfig.timeout
    }
    else if (message.endsWith('canceled')) {
      throw error
    }

    if (message === lastCustomToastConfig.duplicateRequest) {
      errorMsg = lastCustomToastConfig.duplicateRequest
    }
    else if (!status) {
      errorMsg = lastCustomToastConfig.networkError
    }
    else if (status === 401) {
      errorMsg = lastCustomToastConfig.tokenExpired
    }
    else if (status === 403) {
      errorMsg = lastCustomToastConfig.noPermission
    }
    else if (status >= 500) {
      errorMsg = lastCustomToastConfig.serverError
    }
    else if ((data as ErrorResponse).success === false) {
      errorMsg = lastCustomToastConfig.businessError?.replace(
        '{msg}',
        data.message || '未知错误',
      )
    }
    else {
      errorMsg = `请求失败：${message}`
    }

    // 执行错误钩子
    try {
      await apiConfig.hooks?.onError?.(requestMeta, new Error(errorMsg, { cause: fetchError }))
    }
    catch (e) {
      console.error('[API] 错误处理失败', e)
      errorMsg = '请求处理异常，请稍后重试'
    }
    finally {
      // 客户端弹出提示
      if (import.meta.client) {
        const translatedMsg = translateMessage(errorMsg || '', i18n)
        toastFn(translatedMsg)
      }
    }

    throw new Error(errorMsg, { cause: fetchError })
  }

  // ========================= Token 刷新管理器（核心） =========================
  /**
   * Token 刷新管理器（单例模式）
   * 解决：并发请求401时，只刷新一次token，所有请求等待结果
   */
  class TokenRefreshManager {
    private refreshing = false
    // 等待队列：存储所有等待token刷新的请求
    private waiters: Array<{
      resolve: (value: boolean) => void
      reject: (reason: Error) => void
    }> = []

    /**
     * 是否正在刷新token
     */
    get isRefreshing() {
      return this.refreshing
    }

    /**
     * 等待token刷新完成
     * @returns 刷新结果
     */
    async waitForRefresh(): Promise<boolean> {
      if (!this.refreshing) {
        return true
      }
      return new Promise((resolve, reject) => {
        this.waiters.push({ resolve, reject })
      })
    }

    /**
     * 执行token刷新
     * @returns 刷新结果
     */
    async doRefresh(): Promise<boolean> {
      // 防止重复刷新
      if (this.refreshing) {
        return this.waitForRefresh()
      }

      this.refreshing = true

      try {
        // 调用store刷新token
        const newToken = await authStore.getRefreshToken()
        if (!newToken) {
          throw new Error('auth.tokenRefreshFailed')
        }

        // 刷新成功：通知所有等待请求
        this.refreshing = false
        const waiters = [...this.waiters]
        this.waiters = []
        waiters.forEach(w => w.resolve(true))

        return true
      }
      catch (err) {
        // 刷新失败：拒绝所有等待请求 + 清空token + 跳转登录
        this.refreshing = false
        const error = new Error(customToastConfig.tokenExpired, { cause: err })
        const waiters = [...this.waiters]
        this.waiters = []
        waiters.forEach(w => w.reject(error))

        authStore.clearToken()
        if (import.meta.client) {
          await nuxtApp.runWithContext(() => authStore.toLogin())
        }
        throw error
      }
    }
  }

  // 创建token刷新管理器单例
  const tokenRefreshManager = new TokenRefreshManager()

  // ========================= 请求重试 + 超时 + Token 刷新核心 =========================
  /**
   * 请求重试逻辑
   * @param param0 配置参数
   * @returns 请求结果
   */
  const retryRequest = async <T>({
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
  }): Promise<T> => {
    // 合并配置
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
      // 如果正在刷新token，等待结果
      if (tokenRefreshManager.isRefreshing && lastCustomRequestConfig.withToken) {
        const refreshSuccess = await tokenRefreshManager.waitForRefresh()
        if (!refreshSuccess) {
          throw new Error('auth.tokenRefreshFailed')
        }
        return retryRequest({ abortKey, apiConfig, options, fetchFn, retry, isAfterRefresh: true })
      }

      // 请求超时处理
      timer = setTimeout(() => {
        const abortState = abortStateMap.get(abortKey)
        if (abortState) {
          abortState.abortController.abort('timeout')
          abortState.abortController = new AbortController()
        }
        clearTimeout(timer!)
      }, timeout)

      // 执行请求
      const res = await fetchFn()

      timer && clearTimeout(timer)

      return res
    }
    catch (error) {
      timer && clearTimeout(timer)
      const fetchError = error as FetchError

      // 超时重试逻辑
      if (
        fetchError.message?.includes('timeout')
        && lastCustomRetryConfig.maxCount
        && retry < lastCustomRetryConfig.maxCount
      ) {
        // 指数退避算法
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

      // 非401错误直接抛出，已经刷新过token仍失败，直接抛出
      if (fetchError.status !== 401 || isAfterRefresh) {
        throw error
      }

      // 正在刷新，等待结果
      if (tokenRefreshManager.isRefreshing) {
        const refreshSuccess = await tokenRefreshManager.waitForRefresh()
        if (!refreshSuccess) {
          throw new Error('auth.tokenRefreshFailed')
        }
      }
      else {
        // 执行token刷新
        await tokenRefreshManager.doRefresh()
      }

      return retryRequest({ abortKey, apiConfig, options, fetchFn, retry, isAfterRefresh: true })
    }
  }

  // ========================= 请求配置预处理 =========================
  /**
   * 预处理请求配置（添加token、csrf、序列化等）
   * @param fullUrl 完整请求地址
   * @param apiConfig 实例配置
   * @param options 请求配置
   * @returns 处理后的配置
   */
  const processRequestOptions = async (
    fullUrl: string,
    apiConfig: ApiInstanceConfig,
    options: FetchOptionsExtend,
  ): Promise<FetchOptionsExtend> => {
    try {
      const token = authStore.getToken()
      const csrfToken = getCsrfToken()
      const normalizedHeaders = normalizeHeaders(options.headers)
      const lastHeaders = {
        ...customRequestConfig.headers,
        ...apiConfig.customRequest?.headers,
        normalizedHeaders,
      }
      const lastCustomRequesetConfig: CustomRequestConfig = {
        ...customRequestConfig,
        ...apiConfig.customRequest,
        ...options.customRequest,
      }

      // 添加Content-Type
      if (!normalizedHeaders['Content-Type'] && lastHeaders.contentType) {
        normalizedHeaders['Content-Type'] = lastHeaders.contentType
      }
      // 添加CSRF Token
      if (csrfToken && lastHeaders.csrfToken) {
        normalizedHeaders[lastHeaders.csrfToken] = csrfToken
      }
      // 添加认证Token
      if (token && lastCustomRequesetConfig.withToken && lastHeaders.token) {
        normalizedHeaders[lastHeaders.token] = `Bearer ${token}`
      }

      // 合并所有配置
      const processedOptions: FetchOptionsExtend = {
        ...fetchOptionConfig,
        ...apiConfig,
        ...options,
        headers: normalizedHeaders,
      }

      // FormData序列化
      if (
        lastCustomRequesetConfig.serializeForm
        && processedOptions.body instanceof FormData
      ) {
        processedOptions.body = Object.fromEntries(processedOptions.body.entries())
      }

      // 执行请求前钩子
      await apiConfig.hooks?.beforeRequest?.({
        url: fullUrl,
        method: options.method || 'GET',
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

  // ========================= 创建 API 客户端 =========================
  /**
   * 创建API请求客户端
   * @param apiConfig 实例配置
   * @returns 请求函数
   */
  const createApiClient = (apiConfig: ApiInstanceConfig = {}) => {
    const fetchInstance = $fetch.create({})

    /**
     * 核心请求函数
     * @param url 请求地址
     * @param options 请求配置
     * @returns 请求结果
     */
    const request = async <T>(
      url: string,
      options: FetchOptionsExtend,
    ): Promise<T> => {
      const { baseURL = '' } = options
      const fullUrl = `${baseURL}${url}`
      const lastCustomRequesetConfig: CustomRequestConfig = {
        ...customRequestConfig,
        ...apiConfig.customRequest,
        ...options.customRequest,
      }
      const method = options.method || 'GET'
      const {
        abortKey = generateAbortKey(baseURL, url, method, options, apiConfig),
        componentKey,
      } = lastCustomRequesetConfig

      // 请求元数据
      const requestMeta: RequestMeta = {
        url: fullUrl,
        method,
        query: options.query,
        body: options.body,
      }

      // 重复请求拦截：相同请求直接返回正在进行的Promise
      const inFlightRequest = abortStateMap.get(abortKey)?.inFlightRequest
      if (inFlightRequest) {
        const lastCustomToastConfig: CustomToastConfig = {
          ...customToastConfig,
          ...apiConfig.customToast,
          ...options.customToast,
        }
        logRequest('request', requestMeta, {
          status: -1,
          data: lastCustomToastConfig.duplicateRequest,
        })
        return inFlightRequest.promise as T
      }

      // 合并缓存配置
      const lastCustomCacheConfig: CustomCacheConfig = {
        ...customCacheConfig,
        ...apiConfig.customCache,
        ...options.customCache,
      }
      let cacheKey = ''
      // 缓存读取：命中缓存直接返回
      if (lastCustomCacheConfig?.enable) {
        cacheKey = generateCacheKey(
          baseURL,
          url,
          method,
          options,
          lastCustomCacheConfig.keyPrefix || '',
        )
        const cacheItem = requestCache.value[cacheKey]
        if (cacheItem && cacheItem.expireTime > Date.now()) {
          cacheItem.lastAccessTime = Date.now()
          requestCache.value = { ...requestCache.value, [cacheKey]: cacheItem }
          logRequest('response', requestMeta, { status: 20, data: '从缓存读取' })
          return cacheItem.data as T
        }
      }

      // 合并Loading配置
      const lastCustomLoadingConfig: CustomLoadingConfig = {
        ...customLoadingConfig,
        ...apiConfig.customLoading,
        ...options.customLoading,
      }

      // 创建请求取消控制器
      const abortController = new AbortController()
      // 包装请求Promise
      const requestPromise = (async (): Promise<T> => {
        try {
          const startTime = Date.now()
          logRequest('request', requestMeta)

          // 执行带重试/刷新token的请求
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

          // 执行请求后钩子
          await apiConfig.hooks?.afterResponse?.(requestMeta, response)

          // 写入缓存
          if (
            lastCustomCacheConfig.enable
            && lastCustomCacheConfig.ttl
            && cacheKey
            && response
          ) {
            requestCache.value = {
              ...requestCache.value,
              [cacheKey]: {
                data: response,
                expireTime: Date.now() + lastCustomCacheConfig.ttl,
                lastAccessTime: Date.now(),
              },
            }
            // 定期清理缓存
            Date.now() % 10 === 0 && cleanExpiredCache()
          }

          logRequest('response', requestMeta, {
            status: 200,
            data: response,
            duration: Date.now() - startTime,
          })
          return response as T
        }
        catch (error) {
          // 统一错误处理
          throw await handleRequestError(error, requestMeta, apiConfig, options)
        }
        finally {
          // 无论成功失败，清理请求
          clearRequest(abortKey)
        }
      })()

      // 存储请求控制器
      abortStateMap.set(abortKey, {
        abortController,
        inFlightRequest: { promise: requestPromise, createTime: Date.now() },
        componentKey,
        loadingKey: import.meta.client && lastCustomLoadingConfig.enable ? lastCustomLoadingConfig.key : undefined,
      })

      // 开启Loading
      incrLoading(abortKey)
      return requestPromise
    }

    return request
  }

  // ========================= 客户端生命周期 =========================
  if (import.meta.client) {
    // 启动缓存清理定时器
    if (customCacheConfig.cleanInterval) {
      cacheCleanTimer = setInterval(cleanExpiredCache, customCacheConfig.cleanInterval)
    }
    // 启动超时请求清理定时器
    flightRequestCleanTimer = setInterval(cleanExpiredFlightRequests, 5 * 60 * 1000)

    // 页面卸载时清理所有资源
    window.addEventListener('beforeunload', () => {
      cleanCacheTimer()
      cancelAllRequest('页面卸载，取消请求')
    })
  }

  // 向全局提供API方法
  return {
    provide: {
      api: createApiClient(),
      cancelRequest,
      cancelAllRequest,
      cancelComponentRequests,
      clearRequestCache,
    },
  }
})
