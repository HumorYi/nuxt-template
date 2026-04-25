import type { ApiResponse } from '~/types/api'
import type { LoginBody, LoginRes } from '~/types/auth'
import { getPreUrl } from '~/utils/api'

const { post } = useApi({ preUrl: getPreUrl(import.meta.url) })

export async function login(body: LoginBody) {
  const res = await post('/login', {
    body,
    // customLoading: { key: 'test' }
  })

  return res.data.value as ApiResponse<LoginRes>
}

export async function logout() {
  const res = await post('/logout')

  return res.data.value as ApiResponse<LoginRes>
}

export async function refreshToken(token: string) {
  const res = await post('/refresh-token', {
    headers: { 'X-Refresh-Token': token },
  })

  return res.data.value as ApiResponse<LoginRes>
}
