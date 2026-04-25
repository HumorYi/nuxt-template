export default defineNuxtRouteMiddleware((to) => {
  const targetPath = '/forbidden'

  if (!useUserStore().hasMiddlewarePermission(to) && to.path !== targetPath) {
    return navigateTo(targetPath)
  }
})
