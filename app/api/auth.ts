import type { ApiResponse } from '~/types/api'

interface LoginBody {
  username: string
  password: string
}

interface LoginRes {
  accessToken: string
  refreshToken: string
}

export function useAuthApi() {
  const { get } = useApi()

  async function login(query: LoginBody) {
    const res = await get<ApiResponse<LoginRes>>('/login', {
      query,

      // customLoading: { key: 'test' }
    })

    return res.data.value
  }

  return { login }
}
