import type { UserRes } from '~/types/api/user'
import type { ApiResponse } from '~/types/http'
import { getPreUrl } from '~/utils/api'

const { get } = useApi({ preUrl: getPreUrl(import.meta.url) })

export async function getUser() {
  const res = await get('/base-info')

  return res.data.value as ApiResponse<UserRes>
}
