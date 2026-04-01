export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event)

  return { success: true, message: ' 创建 hello name', data: { body } }
})
