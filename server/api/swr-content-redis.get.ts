const opts = {
  maxAge: 5,
  staleMaxAge: 2,
  name: 'swr-content',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const focus = query.focus === 'true'
  const lang = getCookie(event, 'i18n_redirected') || 'zh'
  const targetKey = `${opts.name}:${lang}`

  const storage = await useStorage('redis')
  const cache = await storage.getItem(targetKey)
  const lastUpdated = Date.now()

  let message = '缓存未过期'
  let returnTime = lastUpdated

  if (cache) {
    const cacheTime = Number(cache)
    const pastTime = (lastUpdated - cacheTime) / 1000

    // 自定义 SWR 逻辑
    if (focus || pastTime > opts.maxAge + opts.staleMaxAge) {
      await storage.setItem(targetKey, lastUpdated.toString())
      message = '立即更新缓存'
    }
    else if (pastTime > opts.maxAge) {
      message = '后台更新缓存'
      returnTime = cacheTime
      event.waitUntil(storage.setItem(targetKey, lastUpdated.toString()))
    }
    else {
      returnTime = cacheTime
    }
  }
  else {
    await storage.setItem(targetKey, lastUpdated.toString())
    message = '首次生成缓存'
  }

  return {
    success: true,
    message,
    data: {
      lang,
      lastUpdated: new Date(returnTime).toLocaleString(),
    },
  }
})
