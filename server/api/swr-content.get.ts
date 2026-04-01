import type { H3Event } from 'h3'

const opts = {
  swr: true,
  maxAge: 5,
  staleMaxAge: 2,
  name: 'swr-content',
  getKey: (event: H3Event) => getCookie(event, 'i18n_redirected') || 'zh',
  varies: ['cookie'],
}

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const focus = query.focus === 'true'
  const lang = opts.getKey(event)

  const lastUpdated = Date.now()
  let message = '生成新数据'

  if (focus) {
    await useStorage('cache').removeItem(
      `nitro:handlers:${opts.name}:${lang}`,
    )
    message = '强制刷新成功'
  }

  return {
    success: true,
    message,
    data: {
      lang,
      lastUpdated: new Date(lastUpdated).toLocaleString(),
    },
  }
}, opts)
