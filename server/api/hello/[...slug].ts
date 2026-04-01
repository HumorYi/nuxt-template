import { createRouter, defineEventHandler, useBase } from 'h3'

const router = createRouter()

router.get('/test/foo', defineEventHandler(() => 'Hello World'))

export default useBase('/api/hello', router.handler)

// export default defineWrappedResponseHandler((event) => {
//   console.log(event.context.matchedRoute?.path)
//   console.log(event.context.params?.slug)

//   // event.context.path to get the route path: '/api/foo/bar/baz'
//   // event.context.params._ to get the route segment: 'bar/baz'
//   return { success: true, message: ' 获取 hello name', data: `Hello, ${event.context.params?.slug}!` }
// })
