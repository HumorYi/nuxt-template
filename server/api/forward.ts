export default defineWrappedResponseHandler((event) => {
  return event.$fetch('/api/hello')
})
