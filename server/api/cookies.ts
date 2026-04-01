export default defineWrappedResponseHandler((event) => {
  const cookies = parseCookies(event)

  return { success: true, message: 'cookies', data: cookies }
})
