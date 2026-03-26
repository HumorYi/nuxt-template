import type { NuxtPage } from 'nuxt/schema'
import type { ApiPluginConfig } from './app/types/api'
import process from 'node:process'

import eslintPlugin from 'vite-plugin-eslint2'

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  imports: {
    dirs: ['api']
  },

  sourcemap: isProd,

  experimental: {},

  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiOtherBase: process.env.NUXT_PUBLIC_API_OTHER_BASE,
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      apiOtherUrl: process.env.NUXT_PUBLIC_API_OTHER_URL,
      apiPlugin: {
        // customLoading: { enable: true, key: 'global' },
        // timeout: 1 * 1000
      } as ApiPluginConfig
    }
  },

  css: ['@unocss/reset/normalize.css', '~/assets/styles/index.scss'],

  unocss: { nuxtLayers: true },

  vite: {
    ssr: { noExternal: ['vue'] },
    css: {
      preprocessorMaxWorkers: true,
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/styles/variables" as vars;
            @use "~/assets/styles/mixins" as mixins;
          `
        }
      }
    },
    server: {
      proxy: {
        [process.env.NUXT_PUBLIC_API_BASE]: {
          // secure: false, // https接口需配置
          // ws: true, // 支持 websocket
          changeOrigin: true,
          target: process.env.NUXT_PUBLIC_API_URL,
          rewrite: (path: string) =>
            path.replace(new RegExp(`^${process.env.NUXT_PUBLIC_API_BASE}`), '')
        },
        [process.env.NUXT_PUBLIC_API_OTHER_BASE]: {
          // secure: false, // https接口需配置
          // ws: true, // 支持 websocket
          changeOrigin: true,
          target: process.env.NUXT_PUBLIC_API_OTHER_URL,
          rewrite: (path: string) =>
            path.replace(
              new RegExp(`^${process.env.NUXT_PUBLIC_API_OTHER_BASE}`),
              ''
            )
        }
      }
    },
    plugins: [eslintPlugin()]
  },

  ssr: true,

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'XX科技 - 专业XX解决方案提供商',
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://你的企业域名.com' }
        // 通用外部样式表 S
        // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css' }
        // 通用外部样式表 E
      ]
    }
  },

  nitro: {
    preset: 'node-server',
    // preset: 'static',
    // prerender: {
    //   routes: ['/'],
    //   ignore: ['/admin/**'],
    //   crawlLinks: true, // 自动爬取站内链接，补充预渲染路由
    // },
    compressPublicAssets: { brotli: true, gzip: true },
    devProxy: {
      [process.env.NUXT_PUBLIC_API_BASE]: {
        // secure: false, // https接口需配置
        // ws: true, // 支持 websocket
        changeOrigin: true, // 关键：修改请求源
        prependPath: true, // 自动拼接路径
        target: process.env.NUXT_PUBLIC_API_URL
      },
      [process.env.NUXT_PUBLIC_API_OTHER_BASE]: {
        // secure: false, // https接口需配置
        // ws: true, // 支持 websocket
        changeOrigin: true, // 关键：修改请求源
        prependPath: true, // 自动拼接路径
        target: process.env.NUXT_PUBLIC_API_OTHER_URL
      }
    }
  },

  modules: [
    '@nuxtjs/seo',
    '@nuxt/eslint',
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/image'
  ],

  eslint: {
    // checker: true,
    config: {
      standalone: false,
      autoInit: false
    }
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
    cookieOptions: { sameSite: 'lax' },
    debug: isDev
  },

  site: {
    url: process.env.NUXT_SITE_URL,
    name: process.env.NUXT_SITE_NAME,
    description: process.env.NUXT_SITE_DESCRIPTION
  },

  // 配置站点地图
  sitemap: {
    // 包含的路由（自动抓取 pages 目录，动态路由需手动配置）
    // routes: ['/'],
    // 可选：排除不需要索引的路由
    exclude: ['/404'],
    zeroRuntime: true, // 核心：启用零运行时模式，适配静态路由场景
    // 优先级/更新频率
    defaults: {
      changefreq: 'daily', // 每天更新
      priority: 0.8, // 优先级（0-1，首页设 1.0）
      lastmod: new Date().toISOString()
    }
  },

  // robots.txt（引导爬虫抓取）
  robots: {
    groups: [{ userAgent: ['GPTBot', 'ChatGPT-User'], disallow: ['/'] }]
  },

  ogImage: {},

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'My Company',
      logo: '/logo.png',
      sameAs: ['https://twitter.com/mycompany']
    }
  },

  linkChecker: {
    failOnError: true,
    // generate reports
    report: {
      html: true,
      markdown: true
    }
  },

  seo: {
    debug: true,
    meta: {
      // Basic SEO
      description: 'My awesome website',
      author: 'Harlan Wilton',
      fallbackTitle: 'My Awesome Site', // Used when page doesn't set a title

      // Theme & Color
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' }
      ],
      colorScheme: 'dark light',

      // Social Media
      twitterCreator: '@mytwitter',
      twitterSite: '@mysite',

      // App Info
      applicationName: 'My App',

      // Nuxt SEO Utils already sets the below tags for you
      ogSiteName: 'My Site Name',
      ogLocale: 'en_US',
      ogType: 'website',
      ogUrl: 'https://example.com',
      ogTitle: 'My Site',

      // Other Nuxt SEO modules handle these
      ogImage: 'https://example.com/my-og-image.png',
      robots: 'index, follow'
    }
  },

  // 图片优化
  image: {
    quality: 80, // 图片压缩质量（平衡体积和清晰度）
    format: ['webp', 'avif'] // 自动转换为高性能格式
  },

  hooks: {
    'pages:extend': function (pages) {
      const excludeDirs = ['components', 'composables', 'styles']
      const includeSuffixs = ['.vue']
      const removeIndexs: number[] = []

      pages.forEach((page, index) => {
        const filePath = page.file || ''

        const isExcludeDir = excludeDirs.some(dir =>
          filePath.includes(`/${dir}/`)
        )
        const isInvalidSuffix = !includeSuffixs.some(suffix =>
          filePath.endsWith(suffix)
        )

        if (isExcludeDir || isInvalidSuffix) {
          removeIndexs.unshift(index)
        }
      })

      removeIndexs.forEach(idx => pages.splice(idx, 1))
    },

    'pages:resolved': function (pages) {
      function setMiddleware(pages: NuxtPage[]) {
        if (!pages?.length) return

        for (const page of pages) {
          page.meta ||= {}

          const { meta, children } = page
          const { groups = [] } = meta
          const isAuth = groups.includes('auth')
          const isPermission = groups.includes('permission')

          if (isPermission) {
            meta.middleware = ['permission', ...(meta.middleware || [])]
          }

          if (isAuth || isPermission) {
            meta.middleware = ['auth', ...(meta.middleware || [])]
          }

          if (children) setMiddleware(children)
        }
      }

      setMiddleware(pages)
    }
  }
})
