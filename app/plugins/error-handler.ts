export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (error, _instance, _info) => {
    console.log(error)
  })
})
