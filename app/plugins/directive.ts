export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('focus', {
    mounted (el) {
      el.focus()
    },
    getSSRProps (_binding, _vnode) {
      // you can provide SSR-specific props here
      return {}
    },
  })
})
