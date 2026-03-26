/** 导入 ofetch 原生请求配置类型，作为扩展基础 */
import type { FetchOptions, ResponseType } from 'ofetch'

/**
 * HTTP 请求方法类型别名
 * 覆盖 RFC 7231 标准的常用 HTTP 方法
 */
export type HttpMethod =
  | 'GET' // 获取资源
  | 'POST' // 创建资源
  | 'PUT' // 全量更新资源
  | 'DELETE' // 删除资源
  | 'PATCH' // 增量更新资源
  | 'HEAD' // 获取响应头（无响应体）
  | 'OPTIONS' // 预检请求，获取服务器支持的方法

export type RequestCredentials = 'include' | 'omit' | 'same-origin'

/**
 * 需要排除/特殊处理的请求头名称
 * 通常用于鉴权、安全相关的敏感请求头
 */
export type ExcludedHeader =
  | 'Authorization' // 访问令牌请求头
  | 'X-Refresh-Token' // 刷新令牌自定义请求头
  | 'X-CSRF-Token' // 跨站请求伪造防护令牌请求头

/**
 * API 统一响应格式接口
 * 后端返回的所有接口需遵循此格式
 * @template T - 响应数据的具体类型，默认任意类型
 */
export interface ApiResponse<T = Record<string, unknown>> {
  /** 业务状态码（非 HTTP 状态码），如 200 成功、401 未授权 */
  code: number
  /** 响应提示信息，用于前端展示 */
  message: string
  /** 请求是否成功的布尔标识，简化状态判断 */
  success: boolean
  /** 响应主体数据 */
  data: T
}

/**
 * 错误响应格式接口
 * 用于统一处理业务错误/网络错误
 */
export type ErrorResponse = ApiResponse

/**
 * 令牌刷新响应接口
 * 刷新令牌接口返回的专属格式
 */
export type TokenResponse = ApiResponse<{
  /** 新的访问令牌 */
  accessToken: string
  /** 新的刷新令牌 */
  refreshToken: string
}>

export interface CustomLoadingConfig {
  /** 是否显示全局加载状态，默认：false */
  enable?: boolean
  /** 加载状态唯一标识（多请求区分加载态），默认：'global' */
  key?: string
}

export interface CustomCacheConfig {
  /** 是否显示缓存，默认：false */
  enable?: boolean
  /** 缓存默认有效期（毫秒），默认 300000（5 分钟） */
  ttl?: number
  /** 支持缓存的请求方法，默认 ['GET'] */
  methods?: HttpMethod[]
  /** 缓存键前缀，避免与其他缓存冲突，默认 'api_cache_' */
  keyPrefix?: string
}

export interface CustomGlobalCacheConfig extends CustomCacheConfig {
  /** 缓存最大容量（条目数），默认 100 */
  maxSize?: number
  /** 缓存自动清理间隔（毫秒），默认 300000（5 分钟） */
  cleanInterval?: number
}

export interface CustomRetryConfig {
  /** 最大重试次数，默认不重试 0 */
  maxCount?: number
  /** 重试基础延迟时间（毫秒），默认 1000（1 秒），采用指数退避策略 */
  baseDelay?: number
  /** 重试最大延迟时间（毫秒），默认 10000（10 秒） */
  maxDelay?: number
}

export interface CustomRequestConfig {
  /!** 超时参数写在此处，而不是 useFetch 默认位置，默认请求超时时间（毫秒），默认 10 * 1000（10 秒） */
  timeout?: number
  /** 是否携带令牌（Authorization 头），默认 true */
  withToken?: boolean
  /** 是否序列化表单数据（如 application/x-www-form-urlencoded），默认 true */
  serializeForm?: boolean

  /** 取消请求的唯一标识（用于取消重复请求），默认根据请求参数生成 */
  abortKey?: string
  /** 取消请求键前缀，默认 'api_abort_' */
  abortKeyPrefix?: string
  /** 组件唯一标识，用于卸载时清理该组件发起的所有请求，默认组件实例 uid */
  componentKey?: string

  // 请求头
  headers?: {
    /** 默认 Content-Type，默认 'application/json;charset=utf-8' */
    contentType?: string
    // 访问令牌请求头，默认 'Authorization'
    token?: string
    // CSRF 令牌请求头，默认 'X-CSRF-Token'
    csrfToken?: string
  }
}

export interface CustomToastConfig {
  /** 超时提示文案，默认 '请求超时，请检查网络后重试' */
  timeout?: string
  /** 网络错误提示文案，默认 '网络异常，请检查网络连接' */
  networkError?: string
  /** 令牌过期提示文案，默认 '登录状态已过期，请重新登录' */
  tokenExpired?: string
  /** 无权限提示文案，默认 '暂无权限执行该操作，请联系管理员' */
  noPermission?: string
  /** 服务器错误提示文案，默认 '服务器内部错误，请稍后重试' */
  serverError?: string
  /** 配置错误提示文案，默认 'API 配置异常，请检查接口地址' */
  configError?: string
  /** 重复请求提示文案，默认 '当前请求正在处理中，请勿重复操作' */
  duplicateRequest?: string
  /** 业务错误提示文案，默认 '业务处理失败：{message}'（{message} 为占位符） */
  businessError?: string
  /** CSRF 令牌错误提示文案，默认 'CSRF 令牌验证失败，请刷新页面' */
  csrfError?: string
  /** 令牌为空提示文案，默认 '登录令牌为空，请重新登录' */
  emptyToken?: string
}

export interface FetchOptionConfig {
  // 携带 Cookie， 默认 'include'
  credentials?: RequestCredentials
  // 默认响应类型为 JSON
  responseType?: ResponseType
}

export interface ApiCommonConfig
  extends FetchOptionConfig, Omit<FetchOptions, 'method'> {
  customLoading?: CustomLoadingConfig
  customCache?: CustomCacheConfig
  customRetry?: CustomRetryConfig
  customRequest?: CustomRequestConfig
  customToast?: CustomToastConfig
}

/**
 * API 实例核心配置接口
 * 每个 API 实例初始化时需传入的基础配置
 */
export interface ApiInstanceConfig extends ApiCommonConfig {
  /** API 基础请求地址（如 https://api.example.com），必填 */
  baseURL: string
  /** 请求生命周期钩子函数 */
  hooks?: {
    /**
     * 请求发送前钩子
     * @param meta - 请求元数据
     * @param options - 最终的请求配置
     * @returns void | Promise<void> - 支持异步操作
     */
    beforeRequest?: (
      meta: RequestMeta,
      options: FetchOptionsExtend
    ) => void | Promise<void>
    /**
     * 响应接收后钩子
     * @param meta - 请求元数据
     * @param response - 原始响应数据
     * @returns void | Promise<void> - 支持异步操作
     */
    afterResponse?: (meta: RequestMeta, response: unknown) => void | Promise<void>
    /**
     * 请求错误钩子（网络错误/业务错误）
     * @param meta - 请求元数据
     * @param error - 错误对象
     * @returns void | Promise<void> - 支持异步操作
     */
    onError?: (meta: RequestMeta, error: Error) => void | Promise<void>
  }
}

/**
 * 扩展的请求配置选项
 * 继承 ofetch 的 FetchOptions 并覆盖 method 类型，新增业务相关配置
 * @extends Omit<FetchOptions, 'method'> - 排除原生 method，改用自定义 HttpMethod
 */
export interface FetchOptionsExtend extends ApiCommonConfig {
  /** HTTP 请求方法，覆盖原生 FetchOptions 的 method 类型 */
  method?: HttpMethod
  abortController?: AbortController
}

/**
 * API 插件全局配置接口
 * 用于初始化插件时的全局默认配置
 */
export interface ApiPluginConfig extends ApiCommonConfig {
  customCache?: CustomGlobalCacheConfig
}

/**
 * 加载状态管理接口
 * 用于全局/局部加载状态的统一管理
 */
export interface LoadingState {
  /** 全局加载状态（如页面级加载） */
  global: boolean
  /** 自定义 key 的加载状态（如按钮级加载），支持动态扩展 */
  [key: string]: boolean
}

/**
 * 请求缓存项接口
 * 存储单条缓存数据及过期信息
 */
export interface RequestCacheItem {
  /** 缓存的响应数据 */
  data: unknown
  /** 缓存过期时间戳（毫秒） */
  expireTime: number
  /** 最后访问时间戳（毫秒），用于 LRU 缓存清理 */
  lastAccessTime: number
}

/**
 * 请求元数据接口
 * 存储请求的核心信息，用于钩子函数/日志/错误追踪
 */
export interface RequestMeta {
  /** 完整请求地址（含 baseURL） */
  url: string
  /** HTTP 请求方法（大写） */
  method: HttpMethod
  /** URL 查询参数 */
  query?: Record<string, unknown> | null
  /** 请求体数据 */
  body?: BodyInit | Record<string, unknown> | null
}
