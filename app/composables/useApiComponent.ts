// 生成组件唯一标识（基于Vue实例UID）
function generateComponentKey(): string {
  if (import.meta.server) {
    return ''
  }

  const instance = getCurrentInstance()

  return instance ? `component_${instance.uid}` : ''
}

export function useApiComponent() {
  // 生成当前组件的唯一Key
  const componentKey = generateComponentKey()

  if (!componentKey) {
    return { componentKey, cancel: () => {} }
  }

  const { $cancelComponentAllReq } = useNuxtApp()
  const cancel = (reason?: string) =>
    $cancelComponentAllReq(componentKey, reason)

  // 组件卸载时自动清理所有关联请求
  onUnmounted(() => cancel('component unmounted'))

  return { componentKey, cancel }
}
