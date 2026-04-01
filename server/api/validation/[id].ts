export default defineWrappedResponseHandler((event) => {
  const id = Number.parseInt(getRouterParam(event, 'id') || '') as number

  if (!Number.isInteger(id)) {
    throw createError({
      status: 400,
      statusText: 'ID should be an integer',
    })
  }

  setResponseStatus(event, 202)

  return { success: true, message: 'All good', data: true }
})
