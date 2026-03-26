// 生成组件唯一标识（基于Vue实例UID）
function generateComponentKey(): string {
  if (import.meta.server)
    return ''

  const instance = getCurrentInstance()

  return instance ? `component_${instance.uid}` : ''
}

export function useApiComponent() {
  // 生成当前组件的唯一Key
  const componentKey = generateComponentKey()

  if (!componentKey) {
    if (import.meta.client) {
      console.warn('[API] 无法获取组件实例，无法自动清理请求')
    }

    return {
      componentKey,
      cancelComponentRequests: () => {},
    }
  }

  const { $cancelComponentRequests } = useNuxtApp()

  // 组件卸载时自动清理所有关联请求
  onUnmounted(() => {
    $cancelComponentRequests(componentKey, 'component unmounted')
  })

  return {
    componentKey,
    cancelComponentRequests: (reason?: string) =>
      $cancelComponentRequests(componentKey, reason),
  }
}
