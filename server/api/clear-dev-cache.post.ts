export default defineWrappedResponseHandler(async () => {
  await useStorage('cache').clear()

  return { success: true, msg: '开发缓存已清空' }
})
