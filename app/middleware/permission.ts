export default defineNuxtRouteMiddleware((to) => {
  const targetPath = '/403'

  if (!usePermission(to) && to.path !== targetPath) {
    return navigateTo(targetPath)
  }
})
