export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore()
  const targetPath = '/403'

  if (!userStore.hasMiddlewareRoutePermission(to) && to.path !== targetPath) {
    return navigateTo(targetPath)
  }
})
