import type { LoginBody, LoginRes } from '~/types/api/auth'
import type { ApiResponse } from '~/types/http'
import { getPreUrl } from '~/utils/replace-caller-filename'

const { post } = useApi({ preUrl: getPreUrl() })

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
