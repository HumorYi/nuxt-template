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
