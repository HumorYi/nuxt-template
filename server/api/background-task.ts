async function timeConsumingBackgroundTask() {
  await new Promise(resolve => setTimeout(() => {
    console.log('timeConsumingBackgroundTask');

    resolve(true)
  }, 1000))
}

export default defineWrappedResponseHandler((event) => {
  // schedule a background task without blocking the response
  event.waitUntil(timeConsumingBackgroundTask())

  // immediately send the response to the client
  return { success: true, message: 'done', data: true }
})
