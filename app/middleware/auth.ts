export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  if (!userStore.isLogin && authStore.getToken()) {
    await userStore.getUser()
  }

  if (!userStore.isLogin) {
    return authStore.toLogin(to)
  }
})
