import type { RouteLocationRaw } from 'vue-router'

export function usePermission(to: RouteLocationRaw) {
  return useUserStore().hasRoutePermission(to)
}
