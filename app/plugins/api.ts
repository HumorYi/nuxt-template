import type { FetchError } from 'ofetch'
// 导入API相关的所有类型定义（接口配置、请求配置、缓存、重试、错误等类型）
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
/** 全局Loading状态默认配置：默认关闭，全局唯一标识 */
const customLoadingConfig: CustomLoadingConfig = {
  enable: false,
  key: 'global',
}

/** 全局接口缓存默认配置（LRU淘汰策略）：默认关闭，5分钟过期 */
const customCacheConfig: CustomGlobalCacheConfig = {
  enable: false,
  ttl: 5 * 60 * 1000,
  methods: ['GET'],
  keyPrefix: 'api_cache_',
  maxSize: 100,
  cleanInterval: 5 * 60 * 1000,
}

/** 全局请求重试默认配置：默认关闭重试，基础延迟1秒 */
const customRetryConfig: CustomRetryConfig = {
  maxCount: 0,
  baseDelay: 1000,
  maxDelay: 10 * 1000,
}

/** 全局请求基础默认配置：10秒超时，自动携带Token */
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

/** 全局错误提示文案配置：统一管理所有请求异常提示 */
const customToastConfig: CustomToastConfig = {
  timeout: '请求超时，请检查网络后重试',
  networkError: '网络异常，请检查网络连接',
  tokenExpired: '登录状态已过期，请重新登录',
  noPermission: '暂无权限执行该操作，请联系管理员',
  serverError: '服务器内部错误，请稍后重试',
  configError: 'API 配置异常，请检查接口地址',
  duplicateRequest: '当前请求正在处理中，请勿重复操作',
  businessError: '业务处理失败：{{msg}}',
  csrfError: 'CSRF 令牌验证失败，请刷新页面',
  emptyToken: '登录凭证为空，请重新登录',
}

/** ofetch 原生请求基础配置：携带Cookie、响应格式为JSON */
const fetchOptionConfig: FetchOptionConfig = {
  credentials: 'include',
  responseType: 'json',
}

/** 定时器类型定义：兼容浏览器/服务端环境的定时器类型 */
type Timer = ReturnType<typeof setTimeout> | null

// ========================= 工具函数 =========================
/**
 * 生成对象唯一哈希值
 * 用于生成请求唯一标识（缓存Key / 取消请求Key）
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
 * 标准化请求头
 * 统一处理 Headers对象/数组/普通对象 格式的请求头
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
 * 单例模式获取CSRF Token
 * 仅客户端执行，缓存Token避免重复查询DOM
 */
const getCsrfToken = (() => {
  let csrfToken: string | null = null
  return (): string | null => {
    // 服务端渲染直接返回null
    if (import.meta.server)
      return null
    // 缓存已有Token直接返回
    if (csrfToken)
      return csrfToken
    // 从页面meta标签获取CSRF Token
    const el = document.querySelector('meta[name="csrf-token"]')
    csrfToken = (el as HTMLMetaElement)?.content || null
    return csrfToken
  }
})()

/** 全局提示函数：默认控制台输出，支持外部注册自定义提示组件 */
let toastFn: (_msg: string) => void = (msg) => {
  console.log(`[提示] ${msg}`)
}

/**
 * 注册自定义提示组件
 * @param fn 外部提示方法（如Element Plus的ElMessage）
 */
export function registerApiToast(fn: (_msg: string) => void): void {
  toastFn = fn
}

/** API请求日志模板：统一日志格式 */
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
 * 彩色打印API请求日志
 * 仅开发环境+客户端生效，生产/服务端不打印
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
    // 日志颜色：请求蓝、响应绿、错误红
    const colorMap = {
      request: '#4299e1',
      response: '#48bb78',
      error: '#e53e3e',
    }
    // 合并日志数据
    const logData = Object.assign(logTemplate, {
      time: timestamp,
      type,
      url: meta.url,
      method: meta.method,
      query: JSON.stringify(meta.query),
      body: JSON.stringify(meta.body),
      ...extra,
    })
    // 打印彩色日志
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
 * 同步插件配置
 * 合并 runtimeConfig 中的自定义配置，覆盖全局默认配置
 */
function syncApiConfig(apiPluginConfig: ApiPluginConfig) {
  Object.assign(customLoadingConfig, apiPluginConfig.customLoading || {})
  Object.assign(customCacheConfig, apiPluginConfig.customCache || {})
  Object.assign(customRetryConfig, apiPluginConfig.customRetry || {})
  Object.assign(customRequestConfig, apiPluginConfig.customRequest || {})
  Object.assign(customToastConfig, apiPluginConfig.customToast || {})

  // 同步ofetch原生配置项
  const keys = Object.keys(fetchOptionConfig) as (keyof FetchOptionConfig)[]
  keys.forEach((key) => {
    const configVal = apiPluginConfig[key] as unknown
    if (configVal)
      fetchOptionConfig[key] = configVal
  })
}

/**
 * 生成请求取消唯一Key
 * 用于重复请求拦截、手动取消请求
 */
function generateAbortKey(
  baseURL: string,
  url: string,
  method: HttpMethod,
  options: FetchOptionsExtend,
  apiConfig: ApiInstanceConfig,
): string {
  // 合并最终请求配置
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
    // 排除Token/CSRF等动态请求头，保证相同请求生成相同Key
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
    // 异常时生成临时唯一Key
    return `${abortKeyPrefix}${baseURL}_${url}_${method}_${Date.now()}`
  }
}

/**
 * 生成缓存唯一Key
 * 用于接口数据缓存的存储与读取
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
    // 携带参数则拼接参数哈希
    return options.query ? `${key}_${objectHash(options.query)}` : key
  }
  catch (e) {
    console.error('[API] 生成CacheKey失败', e)
    return `${key}_${Date.now()}`
  }
}

// ========================= Nuxt API插件主入口 =========================
export default defineNuxtPlugin((nuxtApp) => {
  // 获取Nuxt运行时配置
  const runtimeConfig = useRuntimeConfig()
  const { apiPlugin } = runtimeConfig.public
  // 同步插件自定义配置
  if (apiPlugin)
    syncApiConfig(apiPlugin)

  // 权限状态仓库：管理Token、登录状态
  const authStore = useAuthStore()
  // 全局响应式缓存：跨组件共享接口缓存数据
  const requestCache = useState<Record<string, RequestCacheItem>>(
    'request_cache',
    () => ({}),
  )

  /**
   * 请求取消控制器映射表
   * key: 取消请求唯一标识
   * value: 取消控制器 + 请求状态 + 关联信息
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

  // Loading状态管理仓库
  const loadingStore = useLoadingStore()

  // 定时器变量
  let cacheCleanTimer: Timer = null // 缓存清理定时器
  let flightRequestCleanTimer: Timer = null // 超时请求清理定时器

  // Token自动刷新核心变量
  let isRefreshing = false // Token刷新锁：防止并发刷新
  let refreshQueue: Array<() => void> = [] // 401挂起请求队列

  // ========================= Loading状态管理 =========================
  /**
   * 增加Loading计数
   * 相同key的请求，仅第一个开启Loading
   */
  const incrLoading = (key: string) => {
    if (!import.meta.client)
      return
    const abortState = abortStateMap.get(key)
    if (!abortState?.loadingKey)
      return

    // 统计相同loading key的请求数量
    let count = 0
    abortStateMap.forEach((state) => {
      if (state.loadingKey === abortState.loadingKey)
        count++
    })
    // 首次请求开启loading
    if (count === 1)
      loadingStore.open(abortState.loadingKey)
  }

  /**
   * 减少Loading计数
   * 相同key的请求，仅最后一个关闭Loading
   */
  const decrLoading = (key: string) => {
    if (!import.meta.client)
      return
    const abortState = abortStateMap.get(key)
    if (!abortState?.loadingKey)
      return

    let count = 0
    abortStateMap.forEach((state) => {
      if (state.loadingKey === abortState.loadingKey)
        count++
    })
    // 最后一个请求关闭loading
    if (count === 1)
      loadingStore.close(abortState.loadingKey)
    abortState.loadingKey = undefined
  }

  // ========================= 请求清理/取消 =========================
  /** 清理单个请求状态：关闭Loading + 移除控制器 */
  const clearRequest = (key: string): void => {
    decrLoading(key)
    abortStateMap.delete(key)
  }

  /** 取消单个请求 */
  const cancelRequest = (key: string, reason = ''): void => {
    const abortState = abortStateMap.get(key)
    if (!abortState)
      return
    // 执行请求取消
    abortState.abortController.abort(`${reason} canceled`)
    clearRequest(key)
  }

  /** 取消所有请求：路由跳转时调用 */
  const cancelAllRequest = (reason = '路由跳转'): void => {
    abortStateMap.forEach((val, key) => cancelRequest(key, reason))
  }

  /** 按组件取消请求：组件销毁时调用 */
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

  /** 清理超时30秒的请求，防止内存泄漏 */
  const cleanExpiredFlightRequests = (): void => {
    const expireTime = Date.now() - 30 * 1000
    abortStateMap.forEach(({ inFlightRequest }, key) => {
      if (expireTime > inFlightRequest.createTime) {
        cancelRequest(key, '请求超时，自动取消')
      }
    })
  }

  // ========================= 缓存管理 =========================
  /** 清除请求缓存：支持清除单个/全部缓存 */
  const clearRequestCache = (key?: string): void => {
    if (key) {
      const { [key]: _, ...newCache } = requestCache.value
      requestCache.value = newCache
    }
    else {
      requestCache.value = {}
    }
  }

  /** 清理所有定时器，防止内存泄漏 */
  const cleanCacheTimer = (): void => {
    if (cacheCleanTimer)
      clearInterval(cacheCleanTimer)
    if (flightRequestCleanTimer)
      clearInterval(flightRequestCleanTimer)
    cacheCleanTimer = null
    flightRequestCleanTimer = null
  }

  /**
   * 清理过期缓存（LRU淘汰策略）
   * 保留最近使用的缓存，删除过期/旧缓存
   */
  const cleanExpiredCache = (): void => {
    if (!customCacheConfig.maxSize)
      return
    const now = Date.now()
    const currentCache = { ...requestCache.value }

    // 过滤未过期的有效缓存
    const validCache = Object.entries(currentCache).reduce(
      (acc, [key, item]) => {
        if (item.expireTime >= now)
          acc[key] = item
        return acc
      },
      {} as typeof currentCache,
    )

    const cacheKeys = Object.keys(validCache)
    // 未超过最大缓存数，直接保存
    if (cacheKeys.length <= customCacheConfig.maxSize) {
      requestCache.value = validCache
      return
    }

    // 按最后访问时间排序：最新在前
    const sortedKeys = cacheKeys.sort((a, b) => {
      const timeA = validCache[a]?.lastAccessTime ?? 0
      const timeB = validCache[b]?.lastAccessTime ?? 0
      return timeB - timeA
    })

    // 保留指定数量的最新缓存
    const finalCache = sortedKeys.slice(0, customCacheConfig.maxSize).reduce(
      (acc, key) => {
        const cacheItem = validCache[key]
        if (cacheItem)
          acc[key] = cacheItem
        return acc
      },
      {} as Record<string, RequestCacheItem>,
    )

    requestCache.value = finalCache
  }

  // ========================= 统一错误处理 =========================
  /**
   * 处理请求错误
   * 统一错误匹配、提示文案、执行钩子、弹出提示
   */
  const handleRequestError = async (
    error: unknown,
    requestMeta: RequestMeta,
    apiConfig: ApiInstanceConfig,
    options: FetchOptionsExtend,
  ): Promise<void> => {
    const fetchError = error as FetchError
    const { message, status, data } = fetchError
    // 合并最终提示配置
    const lastCustomToastConfig: CustomToastConfig = {
      ...customToastConfig,
      ...apiConfig.customToast,
      ...options.customToast,
    }

    let errorMsg: string | undefined
    // 打印错误日志
    logRequest('error', requestMeta, {
      data,
      status,
      error: message,
    })

    // 匹配错误类型，生成提示文案
    if (message.includes('timeout')) {
      errorMsg = lastCustomToastConfig.timeout
    }
    else if (message.endsWith('canceled')) {
      // 主动取消的请求不提示
      return
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
    else if ((data as ErrorResponse).success) {
      // 业务错误替换占位符
      errorMsg = lastCustomToastConfig.businessError?.replace(
        '{{msg}}',
        data.message || '未知错误',
      )
    }
    else {
      errorMsg = `请求失败：${message}`
    }

    // 执行自定义错误钩子
    try {
      await apiConfig.hooks?.onError?.(
        requestMeta,
        new Error(errorMsg, { cause: fetchError }),
      )
    }
    catch (e) {
      console.error('[API] 错误处理失败', e)
      errorMsg = '请求处理异常，请稍后重试'
    }
    finally {
      // 仅客户端弹出提示
      if (import.meta.client) {
        toastFn(errorMsg || '')
      }
    }
    // 抛出错误，终止请求流程
    throw new Error(errorMsg, { cause: fetchError })
  }

  // ========================= Token刷新队列 =========================
  /**
   * 将401请求加入等待队列
   * 等待Token刷新完成后重新发送请求
   */
  function waitRefreshToken<T>(fetchFn: () => Promise<T>) {
    return new Promise((resolve, reject) => {
      refreshQueue.push(async () => {
        try {
          resolve(await fetchFn())
        }
        catch (e) {
          reject(e)
        }
      })
    })
  }

  // ========================= 请求重试 + 超时 + Token刷新核心 =========================
  const retryRequest = async <T>({
    abortKey,
    apiConfig,
    options,
    fetchFn,
    retry = 0,
    timeout = undefined,
  }: {
    abortKey: string
    apiConfig: ApiInstanceConfig
    options: FetchOptionsExtend
    fetchFn: () => Promise<T>
    retry?: number
    timeout?: number
  }): Promise<T> => {
    // 合并最终配置
    const lastCustomRequesetConfig: CustomRequestConfig = {
      ...customRequestConfig,
      ...apiConfig.customRequest,
      ...options.customRequest,
    }
    const lastCustomRetryConfig: CustomRetryConfig = {
      ...customRetryConfig,
      ...apiConfig.customRetry,
      ...options.customRetry,
    }

    try {
      // Token刷新中，请求加入等待队列
      if (isRefreshing && lastCustomRequesetConfig.withToken) {
        return waitRefreshToken(() =>
          retryRequest({ abortKey, apiConfig, options, fetchFn, retry }),
        )
      }

      // 设置请求超时时间
      timeout ??= lastCustomRequesetConfig.timeout
      // 超时自动取消请求
      const timer = setTimeout(() => {
        const abortState = abortStateMap.get(abortKey)
        if (abortState) {
          abortState.abortController.abort('timeout')
          abortState.abortController = new AbortController()
        }
        clearTimeout(timer)
      }, timeout)

      // 执行请求
      const res = await fetchFn()
      clearTimeout(timer)
      return res
    }
    catch (error) {
      const fetchError = error as FetchError

      // 超时重试：指数退避算法
      if (
        fetchError.message.includes('timeout')
        && lastCustomRetryConfig.maxCount
        && retry < lastCustomRetryConfig.maxCount
      ) {
        // 计算重试延迟
        const delay = Math.min(
          (lastCustomRetryConfig.baseDelay ?? 0)
          * 2 ** retry
          * (0.8 + Math.random() * 0.4),
          lastCustomRetryConfig.maxDelay ?? 0,
        )
        // 递归重试
        return retryRequest({
          abortKey,
          apiConfig,
          options,
          fetchFn,
          retry: retry + 1,
          timeout: timeout + delay,
        })
      }

      // 非401错误直接抛出
      if (fetchError.status !== 401) {
        throw error
      }

      // 401错误：加入刷新队列
      waitRefreshToken(() =>
        retryRequest({ abortKey, apiConfig, options, fetchFn, retry }),
      )
      // 已有刷新任务，直接返回
      if (isRefreshing) {
        return
      }

      // 加锁，开始刷新Token
      isRefreshing = true
      try {
        // 调用仓库方法刷新Token
        const newToken = await authStore.getRefreshToken()
        if (!newToken) {
          throw new Error('getRefreshToken failed')
        }
        // 刷新成功，执行队列中所有挂起请求
        refreshQueue.forEach(fn => fn())
      }
      catch (error) {
        // 刷新失败：清空Token并跳转登录
        authStore.clearToken()
        if (import.meta.client) {
          await nuxtApp.runWithContext(() => authStore.toLogin())
        }
        const lastCustomToastConfig: CustomToastConfig = {
          ...customToastConfig,
          ...apiConfig.customToast,
          ...options.customToast,
        }
        throw new Error(lastCustomToastConfig.tokenExpired, { cause: error })
      }
      finally {
        // 重置状态
        refreshQueue = []
        isRefreshing = false
      }
    }
  }

  /**
   * 请求前置处理
   * 自动添加Token/CSRF、标准化请求头、序列化FormData、执行钩子
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
      // 合并所有请求头
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

      // 设置默认Content-Type
      if (!normalizedHeaders['Content-Type'] && lastHeaders.contentType) {
        normalizedHeaders['Content-Type'] = lastHeaders.contentType
      }
      // 自动添加CSRF Token
      if (csrfToken && lastHeaders.csrfToken) {
        normalizedHeaders[lastHeaders.csrfToken] = csrfToken
      }
      // 自动添加Bearer Token
      if (token && lastCustomRequesetConfig.withToken && lastHeaders.token) {
        normalizedHeaders[lastHeaders.token] = `Bearer ${token}`
      }

      // 合并最终请求配置
      const processedOptions: FetchOptionsExtend = {
        ...fetchOptionConfig,
        ...apiConfig,
        ...options,
        headers: normalizedHeaders,
      }

      // FormData序列化处理
      if (
        lastCustomRequesetConfig.serializeForm
        && processedOptions.body instanceof FormData
      ) {
        processedOptions.body = Object.fromEntries(
          processedOptions.body.entries(),
        )
      }

      // 执行请求前置钩子
      await apiConfig.hooks?.beforeRequest?.(
        {
          url: fullUrl,
          method: options.method || 'GET',
          query: options.query,
          body: options.body,
        },
        processedOptions,
      )

      return processedOptions
    }
    catch (e) {
      console.error('[API] 处理请求配置失败', e)
      return options
    }
  }

  /**
   * 创建API请求客户端
   * 封装所有能力：缓存、重试、Token刷新、请求取消、Loading
   */
  const createApiClient = (apiConfig: ApiInstanceConfig = {}) => {
    const fetchInstance = $fetch.create()

    /** 核心请求方法 */
    const request = async <T>(
      url: string,
      options: FetchOptionsExtend = {},
    ) => {
      const { baseURL } = options
      const fullUrl = `${baseURL}${url}`
      // 合并最终请求配置
      const lastCustomRequesetConfig: CustomRequestConfig = {
        ...customRequestConfig,
        ...apiConfig.customRequest,
        ...options.customRequest,
      }
      const method = options.method || 'GET'
      // 生成取消请求唯一Key
      const {
        abortKey = generateAbortKey(baseURL, url, method, options, apiConfig),
        componentKey,
      } = lastCustomRequesetConfig

      const requestMeta: RequestMeta = {
        url: fullUrl,
        method,
        query: options.query,
        body: options.body,
      }

      // ========================= 重复请求拦截 =========================
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
        // 直接返回正在进行的请求，避免重复请求
        return inFlightRequest.promise as T
      }

      // ========================= 缓存读取 =========================
      const lastCustomCacheConfig: CustomCacheConfig = {
        ...customCacheConfig,
        ...apiConfig.customCache,
        ...options.customCache,
      }
      let cacheKey = ''
      if (lastCustomCacheConfig?.enable) {
        cacheKey = generateCacheKey(
          baseURL,
          url,
          method,
          options,
          lastCustomCacheConfig.keyPrefix || '',
        )
        // 命中缓存直接返回
        const cacheItem = requestCache.value[cacheKey]
        if (cacheItem && cacheItem.expireTime > Date.now()) {
          cacheItem.lastAccessTime = Date.now()
          requestCache.value = { ...requestCache.value, [cacheKey]: cacheItem }
          logRequest('response', requestMeta, {
            status: 200,
            data: '从缓存读取',
          })
          return cacheItem.data as T
        }
      }

      // 合并Loading配置
      const lastCustomLoadingConfig: CustomLoadingConfig = {
        ...customLoadingConfig,
        ...apiConfig.customLoading,
        ...options.customLoading,
      }

      // ========================= 执行请求 =========================
      const requestPromise = (async (): Promise<T> => {
        try {
          const startTime = Date.now()
          logRequest('request', requestMeta)
          // 带重试/Token刷新的请求
          const response = await retryRequest({
            abortKey,
            apiConfig,
            options,
            fetchFn: async () => {
              const processedOptions = await processRequestOptions(
                fullUrl,
                apiConfig,
                options,
              )
              // 发起请求，绑定取消信号
              return fetchInstance<T>(url, {
                ...processedOptions,
                signal: abortStateMap.get(abortKey).abortController.signal,
              })
            },
          })

          // 执行响应后置钩子
          await apiConfig.hooks?.afterResponse?.(requestMeta, response)

          // ========================= 写入缓存 =========================
          if (
            lastCustomCacheConfig.enable
            && lastCustomCacheConfig.ttl !== undefined
            && cacheKey
            && response !== undefined
            && response !== null
          ) {
            requestCache.value = {
              ...requestCache.value,
              [cacheKey]: {
                data: response,
                expireTime: Date.now() + lastCustomCacheConfig.ttl,
                lastAccessTime: Date.now(),
              },
            }
            // 随机触发缓存清理，避免频繁执行
            if (Date.now() % 10 === 0)
              cleanExpiredCache()
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
          // 无论成败，清理请求状态
          clearRequest(abortKey)
        }
      })()

      // 存储请求控制器
      abortStateMap.set(abortKey, {
        abortController: new AbortController(),
        inFlightRequest: { promise: requestPromise, createTime: Date.now() },
        componentKey,
        loadingKey:
          import.meta.client && lastCustomLoadingConfig.enable
            ? lastCustomLoadingConfig.key
            : undefined,
      })

      // 开启Loading
      incrLoading(abortKey)
      return requestPromise
    }

    // 批量注册HTTP请求方法：GET/POST/PUT/DELETE等
    const keys: HttpMethod[] = [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'HEAD',
      'OPTIONS',
    ]

    keys.forEach((key) => {
      request[key.toLowerCase()] = <T>(
        url: string,
        options?: FetchOptionsExtend,
      ) => request<T>(url, { ...options, method: key })
    })

    return request
  }

  // ========================= 客户端生命周期 =========================
  if (import.meta.client) {
    // 启动缓存自动清理定时器
    if (
      customCacheConfig.cleanInterval
      && customCacheConfig.cleanInterval > 0
    ) {
      cacheCleanTimer = setInterval(
        cleanExpiredCache,
        customCacheConfig.cleanInterval,
      )
    }
    // 启动超时请求清理定时器
    flightRequestCleanTimer = setInterval(
      cleanExpiredFlightRequests,
      5 * 60 * 1000,
    )

    // 页面卸载时：清理定时器 + 取消所有请求
    window.addEventListener('beforeunload', () => {
      cleanCacheTimer()
      cancelAllRequest('页面卸载，取消请求')
    })
  }

  // 向全局提供API实例和工具方法
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
