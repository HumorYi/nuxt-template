import type { UserRes } from '~/types/api/user'
import type { ApiResponse } from '~/types/http'
import { getPreUrl } from '~/utils/replace-caller-filename'

const { get } = useApi({ preUrl: getPreUrl() })

export async function getUser() {
  const res = await get('/base-info')

  return res.data.value as ApiResponse<UserRes>
}
