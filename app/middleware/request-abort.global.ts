export default defineNuxtRouteMiddleware(async () => {
  const nuxtApp = useNuxtApp()

  nuxtApp.$cancelAllRequest()
})
