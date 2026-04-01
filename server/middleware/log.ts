export default defineWrappedResponseHandler((event) => {
  console.log(`New request: ${getRequestURL(event)}`)
})
