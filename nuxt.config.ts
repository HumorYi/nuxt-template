import type { NuxtPage } from 'nuxt/schema'
import type { ApiPluginConfig } from './app/types/api'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { env } from 'node:process'
import eslintPlugin from 'vite-plugin-eslint2'

const isDev = env.NODE_ENV === 'development'
const isProd = env.NODE_ENV === 'production'

// 为什么不设置 zh，就算因为如果有繁体，没有对应的繁体翻译，也会使用简体
const defaultLocale = 'zh-CN'

function getFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = resolve(dir, item.name)

    if (item.isDirectory()) {
      files.push(...getFiles(fullPath))
    }
    else {
      files.push(fullPath)
    }
  }

  return files
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  imports: {
    dirs: ['stores'],
  },

  sourcemap: isProd,

  experimental: {},

  runtimeConfig: {
    apiSecret: env.API_SECRET,
    public: {
      apiBase: env.NUXT_PUBLIC_API_BASE,
      apiOtherBase: env.NUXT_PUBLIC_API_OTHER_BASE,
      apiUrl: env.NUXT_PUBLIC_API_URL,
      apiOtherUrl: env.NUXT_PUBLIC_API_OTHER_URL,
      apiPlugin: {
        // customLoading: { enable: true, key: 'global' },
        // timeout: 1 * 1000
      } as ApiPluginConfig,
      site: {
        url: env.NUXT_SITE_URL || '',
        logo: env.NUXT_SITE_LOGO || '',
      },
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
    plugins: [eslintPlugin()],
  },

  app: {
    pageTransition: false, // 缓存场景关闭过渡提升性能
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: env.NUXT_SITE_NAME || '',
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'canonical', href: env.NUXT_SITE_URL || '' },
        // 通用外部样式表 S
        // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css' }
        // 通用外部样式表 E
      ],
    },
  },

  ssr: true,

  nitro: {
    preset: 'node-server',
    prerender: {
      routes: ['/ssg-demo', '/login', '/about', '/forbidden', '/404'],
      ignore: [],
      // crawlLinks: true,
    },
    compressPublicAssets: { brotli: true, gzip: true },
    devProxy: {
      [env.NUXT_PUBLIC_API_BASE as string]: {
        // secure: false, // https接口需配置
        // ws: true, // 支持 websocket
        changeOrigin: true, // 关键：修改请求源
        prependPath: true, // 自动拼接路径
        target: env.NUXT_PUBLIC_API_URL,
      },
      [env.NUXT_PUBLIC_API_OTHER_BASE as string]: {
        // secure: false, // https接口需配置
        // ws: true, // 支持 websocket
        changeOrigin: true, // 关键：修改请求源
        prependPath: true, // 自动拼接路径
        target: env.NUXT_PUBLIC_API_OTHER_URL,
      },
    },
    storage: {
      redis: {
        driver: 'redis',
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DB,
        keyPrefix: 'nuxt4:cache:', // 缓存键前缀，避免冲突
        tls: env.REDIS_TLS === 'true', // 云厂商 Redis 一般开启 TLS
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
    baseUrl: env.NUXT_SITE_URL,
    defaultLocale,
    locales: [
      { code: defaultLocale, language: 'zh-Hans', name: '简体中文', file: 'zh.js' },
      { code: 'zh-Hant', language: 'zh-Hant', name: '繁体中文', file: 'zh-Hant.js' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.js' },
    ],
    vueI18n: './i18n/i18n.config.ts',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      fallbackLocale: defaultLocale,
    },
  },

  site: {
    url: env.NUXT_SITE_URL,
    name: env.NUXT_SITE_NAME,
    description: env.NUXT_SITE_DESCRIPTION,
  },

  // 配置站点地图
  sitemap: {
    // 可选：排除不需要索引的路由
    // exclude: ['/forbidden', '/404'],
    // zeroRuntime: true, // 核心：启用零运行时模式，适配静态路由场景
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

  ogImage: {
    zeroRuntime: true,
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: env.NUXT_SITE_NAME || '',
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
      description: env.NUXT_SITE_DESCRIPTION,
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
      applicationName: env.NUXT_SITE_NAME || '',

      // Nuxt SEO Utils already sets the below tags for you
      ogSiteName: env.NUXT_SITE_NAME || '',
      ogType: 'website',
      ogUrl: env.NUXT_SITE_URL || '',
      ogTitle: env.NUXT_SITE_NAME || '',

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
    'pages:extend': function (pages: NuxtPage[]) {
      const includeSuffixList = ['.vue']
      const removeIndexes: number[] = []

      pages.forEach((page: NuxtPage, index: number) => {
        const filePath = page.file || ''

        const isExcludeDir = filePath.startsWith(`_`)
        const isInvalidSuffix = !includeSuffixList.some(suffix => filePath.endsWith(suffix))

        if (isExcludeDir || isInvalidSuffix) {
          removeIndexes.push(index)
        }
      })

      removeIndexes.sort((a, b) => b - a).forEach(idx => pages.splice(idx, 1))
    },

    'pages:resolved': function (pages: NuxtPage[]) {
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

          if (isAuth) {
            meta.middleware = ['auth', ...(meta.middleware || [])]
          }

          if (children)
            setMiddleware(children)
        }
      }

      setMiddleware(pages)
    },

    'imports:dirs': (dirs: string[]) => {
      const excludes = ['app/utils']
      const removeIndexes: number[] = []

      excludes.forEach((exclude) => {
        const idx = dirs.findIndex(dir => dir.includes(exclude))

        if (idx !== -1) {
          removeIndexes.push(idx)
        }
      })

      removeIndexes.sort((a, b) => b - a).forEach(idx => dirs.splice(idx, 1))
    },
  },

  watch: [
    ...getFiles('uno'),
  ],
})
