export default defineEventHandler(async (event) => {
  await sendRedirect(event, '/api/background-task', 302)
})
