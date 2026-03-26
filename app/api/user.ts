import type { ApiResponse } from '~/types/api'

interface UserRoute {
  path: string
  children?: UserRoute[]
}

interface UserRes {
  id: number
  name: string
  routes: UserRoute[]
  role?: string
}

export function useUserApi() {
  const { get } = useApi()

  async function getUser() {
    const res = await get('/user')

    return res.data.value as ApiResponse<UserRes>
  }

  async function getUser1() {
    const res = await get('/test-one')

    return res.data.value
  }

  async function getUser2() {
    const res = await get('/test-two')

    return res.data.value
  }

  async function getUser3() {
    const res = await get('/test-three')

    return res.data.value
  }

  return { getUser, getUser1, getUser2, getUser3 }
}
