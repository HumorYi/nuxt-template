import type { NuxtPage } from 'nuxt/schema'
import type { ApiPluginConfig } from './app/types/api'
import process from 'node:process'

import eslintPlugin from 'vite-plugin-eslint2'

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

const defaultLocale = 'zh-Hans'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  imports: {
    dirs: ['api'],
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
      } as ApiPluginConfig,
      site: {
        url: process.env.NUXT_SITE_URL || '',
        logo: process.env.NUXT_SITE_LOGO || '',
      }
    },
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
          `,
        },
      },
    },
    server: {
      proxy: {
        [process.env.NUXT_PUBLIC_API_BASE as string]: {
          // secure: false, // https接口需配置
          // ws: true, // 支持 websocket
          changeOrigin: true,
          target: process.env.NUXT_PUBLIC_API_URL,
          rewrite: (path: string) =>
            path.replace(new RegExp(`^${process.env.NUXT_PUBLIC_API_BASE}`), ''),
        },
        [process.env.NUXT_PUBLIC_API_OTHER_BASE as string]: {
          // secure: false, // https接口需配置
          // ws: true, // 支持 websocket
          changeOrigin: true,
          target: process.env.NUXT_PUBLIC_API_OTHER_URL,
          rewrite: (path: string) =>
            path.replace(
              new RegExp(`^${process.env.NUXT_PUBLIC_API_OTHER_BASE}`),
              '',
            ),
        },
      },
    },
    plugins: [eslintPlugin()],
  },

  ssr: true,

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: process.env.NUXT_SITE_NAME || '',
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'canonical', href: process.env.NUXT_SITE_URL || '' },
        // 通用外部样式表 S
        // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css' }
        // 通用外部样式表 E
      ],
    },
  },

  nitro: {
    preset: 'node-server',
    // preset: 'static',
    prerender: {
      // routes: ['/'],
      // ignore: ['/403', '/404'],
      crawlLinks: true, // 自动爬取站内链接，补充预渲染路由
    },
    compressPublicAssets: { brotli: true, gzip: true },
    devProxy: {
      [process.env.NUXT_PUBLIC_API_BASE as string]: {
        // secure: false, // https接口需配置
        // ws: true, // 支持 websocket
        changeOrigin: true, // 关键：修改请求源
        prependPath: true, // 自动拼接路径
        target: process.env.NUXT_PUBLIC_API_URL,
      },
      [process.env.NUXT_PUBLIC_API_OTHER_BASE as string]: {
        // secure: false, // https接口需配置
        // ws: true, // 支持 websocket
        changeOrigin: true, // 关键：修改请求源
        prependPath: true, // 自动拼接路径
        target: process.env.NUXT_PUBLIC_API_OTHER_URL,
      },
    },
  },

  modules: [
    '@nuxtjs/seo',
    '@nuxt/eslint',
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n',
  ],

  eslint: {
    // checker: true,
    config: {
      standalone: false,
      autoInit: false,
    },
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
    cookieOptions: { sameSite: 'lax' },
    debug: isDev,
  },

  i18n: {
    baseUrl: process.env.NUXT_SITE_URL,
    defaultLocale,
    locales: [
      { code: defaultLocale, language: 'zh-Hans', name: '简体中文', file: 'zh.js' },
      { code: 'zh-Hant', language: 'zh-Hant', name: '繁体中文', file: 'zh-Hant.js' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.js' },
    ],
    vueI18n: './i18n/i18n.config.ts',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      fallbackLocale: defaultLocale,
    },
  },

  site: {
    url: process.env.NUXT_SITE_URL,
    name: process.env.NUXT_SITE_NAME,
    description: process.env.NUXT_SITE_DESCRIPTION,
  },

  // 配置站点地图
  sitemap: {
    // 可选：排除不需要索引的路由
    exclude: ['/403', '/404'],
    zeroRuntime: true, // 核心：启用零运行时模式，适配静态路由场景
    // 优先级/更新频率
    defaults: {
      changefreq: 'daily', // 每天更新
      priority: 0.8, // 优先级（0-1，首页设 1.0）
      lastmod: new Date().toISOString(),
    },
  },

  // robots.txt（引导爬虫抓取）
  robots: {
    groups: [{ userAgent: ['GPTBot', 'ChatGPT-User'], disallow: ['/'] }],
  },

  ogImage: {},

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: process.env.NUXT_SITE_NAME || '',
      logo: '/logo.png',
      sameAs: ['https://twitter.com/mycompany'],
    },
  },

  linkChecker: {
    failOnError: true,
    // generate reports
    report: {
      html: true,
      markdown: true,
    },
  },

  seo: {
    debug: true,
    meta: {
      // Basic SEO
      description: process.env.NUXT_SITE_DESCRIPTION,
      author: 'humoryi',

      // Theme & Color
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
      colorScheme: 'dark light',

      // Social Media
      twitterCreator: '@mytwitter',
      twitterSite: '@mysite',

      // App Info
      applicationName: process.env.NUXT_SITE_NAME || '',

      // Nuxt SEO Utils already sets the below tags for you
      ogSiteName: process.env.NUXT_SITE_NAME || '',
      ogType: 'website',
      ogUrl: process.env.NUXT_SITE_URL || '',
      ogTitle: process.env.NUXT_SITE_NAME || '',

      // Other Nuxt SEO modules handle these
      ogImage: 'https://example.com/my-og-image.png',
      robots: 'index, follow',
    },
  },

  // 图片优化
  image: {
    quality: 80, // 图片压缩质量（平衡体积和清晰度）
    format: ['webp', 'avif'], // 自动转换为高性能格式
  },

  hooks: {
    'pages:extend': function (pages) {
      const includeSuffixs = ['.vue']
      const removeIndexs: number[] = []

      pages.forEach((page, index) => {
        const filePath = page.file || ''

        const isExcludeDir = filePath.includes(`_`)
        const isInvalidSuffix = !includeSuffixs.some(suffix =>
          filePath.endsWith(suffix),
        )

        if (isExcludeDir || isInvalidSuffix) {
          removeIndexs.unshift(index)
        }
      })

      removeIndexs.forEach(idx => pages.splice(idx, 1))
    },

    'pages:resolved': function (pages) {
      function setMiddleware(pages: NuxtPage[]) {
        if (!pages?.length)
          return

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

          if (children)
            setMiddleware(children)
        }
      }

      setMiddleware(pages)
    },
  },
})
