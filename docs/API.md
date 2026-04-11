# API 设计

- 遵循 [Nuxt 自定义 useFetch](https://nuxt.zhcndoc.com/docs/4.x/guide/recipes/custom-usefetch#%E8%87%AA%E5%AE%9A%E4%B9%89-usefetchuseasyncdata)

- 实现功能

  - 由于 Nuxt 内部的 useFetch 通过 signal 控制请求，而要扩展路由跳转和组件卸载清除请求，需要使用自定义 singal
  - 基于此，useFetch 的 key 缓存 和 dedupe 取消重复请求 就只能过滤掉，自定义实现
  - 根据请求参数自动生成 abortKey，类似 useFetch 的 key，可自行根据提供的缓存参数设置
  - 通过 abortKey 取消重复请求，类似 useFetch 的 dedupe
  - 通过 组件实例 uid 生成 componentKey，组件卸载时统一清除组件内所有请求
  - 路由跳转时请求所有请求
  - 请求超时重试，默认不重试，可自行设置超时时间、重试次数、重试间隔等
  - 按 loading key 归纳请求，通过计数器控制显隐，可按需设计多个 loading key，适配多 UI

- 服务器端及客户端统一使用 useFetch，避免切换端时手动更改

- app/composables/useApi 已基于 useFetch 做了一层扩展，暴露出通用方法 get、post、put、del

- app/api 存放所有 api 接口，按模块划分，使用示例：app/api/user.ts

  ```ts
  import type { ApiResponse } from '~/types/api'
  import type { UserRes } from '~/types/user'

  const { get } = useApi({ preUrl: '/user' })

  export async function getUser() {
    const res = await get('/base-info')

    return res.data.value as ApiResponse<UserRes>
  }
  ```

- 加服务器端 api，需要在以下文件做扩展
  - 环境变量文件添加 api 地址，命名规则 NUXT\*PUBLIC_API_URL**\*服务器端名称**

    ```text
    .env.development
      NUXT_PUBLIC_API_BASE=/dev-api
      NUXT_PUBLIC_API_OTHER_BASE=/dev-api-other

      NUXT_PUBLIC_API_URL=http://127.0.0.1:5000
      NUXT_PUBLIC_API_OTHER_URL=http://127.0.0.1:5000

    .env.production
      NUXT_PUBLIC_API_BASE=/dev-api
      NUXT_PUBLIC_API_OTHER_BASE=/dev-api-other

      NUXT_PUBLIC_API_URL=http://127.0.0.1:5000
      NUXT_PUBLIC_API_OTHER_URL=http://127.0.0.1:6000
    ```

  - nuxt.config.ts 引入环境变量，命名规则 api + **服务器端名称**

    ```text
    runtimeConfig: {
      public: {
        apiBase: process.env.NUXT_PUBLIC_API_BASE,
        apiOtherBase: process.env.NUXT_PUBLIC_API_OTHER_BASE,
        apiUrl: process.env.NUXT_PUBLIC_API_URL,
        apiOtherUrl: process.env.NUXT_PUBLIC_API_OTHER_URL,
        apiPlugin: {} as ApiPluginConfig, // api 插件默认参数配置
      }
    }
    ```

  - app/composables/useApi.ts 导出 新的服务器端 api

    ```ts
    export const useApi = factory()
    export const useApiOther = factory('apiOtherBase', 'apiOtherUrl')
    ```
