import type { H3Event } from 'h3'

import { appendResponseHeader } from 'h3'

export async function fetchWithCookie(event: H3Event, url: string) {
  /* 获取来自服务器端点的响应 */
  const res = await $fetch.raw(url)
  /* 获取响应中的 cookies */
  const cookies = res.headers.getSetCookie()
  /* 将每个 cookie 附加到我们的传入请求 */
  for (const cookie of cookies) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }
  /* 返回响应数据 */
  return res._data
}
