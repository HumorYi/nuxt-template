export default defineNuxtRouteMiddleware(async () => {
  const nuxtApp = useNuxtApp()
  const authStore = useAuthStore()
  const userStore = useUserStore()

  // 如果没有登录，且有token，获取用户信息，因为有的页面有用户信息就显示，没有不跳转登录页
  if (!userStore.isLogin && authStore.getToken()) {
    await userStore.getUser()
  }

  nuxtApp.$cancelAllRequest()
})
