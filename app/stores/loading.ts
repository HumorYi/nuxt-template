import type { LoadingState } from '~/types/http'

export const useLoadingStore = defineStore('loading', () => {
  const state = ref<LoadingState>({ global: false })

  const open = (key = 'global') => {
    state.value[key] = true
  }

  const close = (key = 'global') => {
    state.value[key] = false
  }

  const clear = () => {
    Object.keys(state.value).forEach(k => close(k))
  }

  return { state, open, close, clear }
})
