import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import type { LoginBody, LoginRes } from '~/types/api/auth'
import { login as loginApi, logout as logoutApi, refreshToken as refreshTokenApi } from '~/api/auth'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const { getUser, clear: clearUser } = useUserStore()
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

    function clear() {
      accessToken.value = ''
      refreshToken.value = ''

      accessTokenCookie.value = null
      refreshTokenCookie.value = null

      clearUser()
    }

    function initToken() {
      if (accessToken.value) {
        return
      }

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
        const res = await refreshTokenApi(val)

        if (res.success) {
          setToken(res.data)

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

    async function login(query: LoginBody) {
      const res = await loginApi(query)

      if (res?.success) {
        setToken(res.data)

        await getUser()

        const { query } = useRoute()

        navigateTo(
          {
            path: query.redirect as string || '/',
            query: { ...query, redirect: undefined },
          },
          { replace: true },
        )
      }
    }

    async function logout() {
      await logoutApi()

      clear()
    }

    return {
      accessToken,
      refreshToken,
      initToken,
      getToken,
      setToken,
      clear,
      getRefreshToken,
      toLogin,
      login,
      logout,
    }
  },
  { persist: true },
)
