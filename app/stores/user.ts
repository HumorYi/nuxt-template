import type {
  RouteLocationNormalizedGeneric,
  RouteLocationRaw,
  RouteRecordNormalized,
} from 'vue-router'

import { useUserApi } from '~/api/user'

interface User {
  id?: number
  name?: string
  [key: string]: unknown
}

export const useUserStore = defineStore('user', () => {
  const userApi = useUserApi()
  const user = ref<User | null>(null)

  async function getUser() {
    const res = await userApi.getUser()

    if (res?.success) {
      user.value = res.data
    }
  }

  const isLogin = computed(() => !!user.value)

  // 路由权限验证，客户端可能通过 路由地址 或 路由名称来判断权限，通过路由表找到对应路由记录，取记录中的分组信息做判断
  function hasRoutePermission(to: RouteLocationRaw) {
    const router = useRouter()
    const routes = router.getRoutes()
    let targetRoute: RouteRecordNormalized | undefined

    if (typeof to === 'string') {
      targetRoute = routes.find(route => route.path === to)
    }
    else {
      const path = to.path
      const name = (to as { name?: string }).name

      targetRoute = routes.find(
        route =>
          (path && route.path && route.path === path)
          || (name && route.name && route.name === name),
      )
    }

    if (!targetRoute)
      return false

    const resolvedRoute = router.resolve(targetRoute.path)

    return hasMiddlewareRoutePermission(
      resolvedRoute as RouteLocationNormalizedGeneric,
    )
  }

  // 路由中间件直接能拿到路由记录，取记录中的分组信息做判断
  function hasMiddlewareRoutePermission(to: RouteLocationNormalizedGeneric) {
    if (!isLogin.value)
      return false

    if (user.value?.role) {
      return hasRoleRoutePermission(to, user.value?.role)
    }

    if (user.value?.routes) {
      return hasDynamicRoutePermission(to, user.value?.routes)
    }

    return true
  }

  function hasRoleRoutePermission(
    to: RouteLocationNormalizedGeneric,
    role: string,
  ) {
    const { groups = [] } = to.meta
    const lastGroups: string[] = []

    groups.forEach(group => lastGroups.push(...group.split('_')))

    return lastGroups.includes(role)
  }

  function hasDynamicRoutePermission(
    to: RouteLocationNormalizedGeneric,
    routes: Record<string, unknown>[],
  ) {
    return getRoutesFullPath(routes).includes(to.fullPath)
  }

  function getRoutesFullPath(
    routes: Record<string, unknown>[],
    parentPath = '',
  ) {
    const arr: string[] = []

    routes.forEach((route) => {
      let routePath = parentPath

      if (route.path) {
        routePath += (route.path.startsWith('/') ? '' : '/') + route.path

        arr.push(routePath)
      }

      if (route.children?.length)
        arr.push(...getRoutesFullPath(route.children, routePath))
    })

    return arr
  }

  return {
    user,
    getUser,
    isLogin,
    hasRoutePermission,
    hasMiddlewareRoutePermission,
  }
})
