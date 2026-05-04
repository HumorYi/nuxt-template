export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  if (!userStore.isLogin) {
    return authStore.toLogin(to)
  }
})
