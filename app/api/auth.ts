import type { ApiResponse } from '~/types/api'

import type { LoginRes } from '~/types/auth'

interface LoginBody {
  username: string
  password: string
}

export function useAuthApi() {
  const { get } = useApi()

  async function login(query: LoginBody) {
    const res = await get('/login', {
      query,

      // customLoading: { key: 'test' }
    })

    return res.data.value as ApiResponse<LoginRes>
  }

  return { login }
}
