export default defineWrappedResponseHandler((event) => {
  const query = getQuery(event)

  return {
    success: true,
    message: ' 获取 hello world',
    data: `hello world, query: ${JSON.stringify(query)}`,
  }
})
