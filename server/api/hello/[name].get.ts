export default defineWrappedResponseHandler((event) => {
  const name = getRouterParam(event, 'name')

  console.log('name', name)

  return { success: true, message: ' 获取 hello name', data: `Hello, ${name}!` }
})
