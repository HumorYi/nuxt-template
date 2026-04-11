import type { ApiResponse } from '~/types/api'
import type { UserRes } from '~/types/user'
import { getPreUrl } from '~/utils/api'

const { get } = useApi({ preUrl: getPreUrl(import.meta.url) })

export async function getUser() {
  const res = await get('/base-info')

  return res.data.value as ApiResponse<UserRes>
}
