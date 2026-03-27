import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import type { ApiResponse } from '~/types/api'
import type { LoginRes } from '~/types/auth'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const cookieOption: Record<string, unknown> = {
      maxAge: 60 * 60 * 24 * 7, // 7 天有效期
      // 本地开发（HTTP）设为 false，生产（HTTPS）设为 true
      secure: import.meta.env.PROD
        ? import.meta.client
          ? window.location.protocol === 'https:'
          : true
        : false,
      httpOnly: import.meta.env.PROD, // 禁止前端 JS 访问（防 XSS）
      sameSite: import.meta.env.PROD ? 'strict' : 'lax', // 防 CSRF
    }
    const accessTokenCookie = useCookie('accessToken', cookieOption)
    const refreshTokenCookie = useCookie('refreshToken', cookieOption)
    const accessToken = ref('')
    const refreshToken = ref('')
    const runtimeConfig = useRuntimeConfig()

    function initToken() {
      if (accessToken.value)
        return

      accessToken.value = accessTokenCookie.value || ''
      refreshToken.value = refreshTokenCookie.value || ''
    }

    function getToken() {
      return import.meta.client ? accessToken.value : accessTokenCookie.value
    }

    async function getRefreshToken() {
      const val = import.meta.client
        ? refreshToken.value
        : refreshTokenCookie.value

      if (val) {
        // 调用 Token 刷新接口
        const response = await $fetch<ApiResponse<LoginRes>>('/refresh-token', {
          baseURL: import.meta.env.DEV
            ? runtimeConfig.public.apiBase
            : runtimeConfig.public.apiUrl,
          headers: { 'X-Refresh-Token': val },
          method: 'POST',
        })

        if (response.success) {
          setToken(response.data)

          return accessToken.value
        }
      }
    }

    function setToken(data: LoginRes) {
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken

      accessTokenCookie.value = accessToken.value
      refreshTokenCookie.value = refreshToken.value
    }

    function clearToken() {
      accessToken.value = ''
      refreshToken.value = ''

      accessTokenCookie.value = null
      refreshTokenCookie.value = null
    }

    function toLogin(to?: RouteLocationNormalizedLoadedGeneric) {
      const route = to || useRoute()

      const targetPath = '/login'

      if (route.path !== targetPath) {
        return navigateTo(
          { path: targetPath, query: { ...route.query, redirect: route.path } },
          { replace: true },
        )
      }
    }

    function toLoginRedirect() {
      const { query } = useRoute()

      navigateTo(
        {
          path: query.redirect as string || '/',
          query: { ...query, redirect: undefined },
        },
        { replace: true },
      )
    }

    return {
      accessToken,
      refreshToken,
      initToken,
      getToken,
      setToken,
      clearToken,
      getRefreshToken,
      toLogin,
      toLoginRedirect,
    }
  },
  { persist: true },
)
