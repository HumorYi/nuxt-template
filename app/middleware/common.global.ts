export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const { groups = [] } = to.meta

  nuxtApp.$cancelAllReq()

  // 如果没有登录，且有token，获取用户信息
  if (!userStore.isLogin && authStore.getToken()) {
    await userStore.getUser()
  }

  // 认证路由组，未登录，跳转登录页
  if (groups.includes('auth') && !userStore.isLogin) {
    return authStore.toLogin(to)
  }

  // 权限路由组，没权限，跳转403页
  if (groups.includes('permission') && !useUserStore().hasPermissionPageByMiddleware(to)) {
    return navigateTo('/forbidden')
  }
})
