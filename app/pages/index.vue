<script setup>
// 企业组织 Schema（首页/关于页必加）
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'XX科技有限公司',
        'legalName': 'XX科技有限公司',
        'url': 'https://你的企业域名.com',
        'logo': 'https://你的企业域名.com/logo.png',
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'telephone': '400-XXXX-XXXX',
            'contactType': 'customer service',
            'areaServed': 'CN',
            'availableLanguage': 'zh-CN',
          },
        ],
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'XX市XX区XX路XX号',
          'addressLocality': 'XX市',
          'postalCode': 'XXXXXX',
          'addressCountry': 'CN',
        },
      }),
    },
  ],
})

useSeoMeta({
  title: '首页 - XX科技_专业XX产品生产厂家_XX解决方案提供商',
})

// defineOgImage('OgImageTemplate.takumi', {
//   title: 'Is this thing on asdfas?',
//   borderColor: '#86efac',
// })

useSchemaOrg([
  {
    '@type': 'Article',
    'headline': '标题',
    'author': [{ '@type': 'Person', 'name': '作者' }],
    'datePublished': '2026-03-24',
  },
])

// const appConfig = useAppConfig()
// console.log('🚀 ~ appConfig:', appConfig)

const authApi = useAuthApi()
const userApi = useUserApi()
const authStore = useAuthStore()
const userStore = useUserStore()

async function user1() {
  const res = await userApi.getUser1()

  console.log(res)
}

async function user2() {
  const res = await userApi.getUser2()

  console.log(res)
}

async function user3() {
  const res = await userApi.getUser3()

  console.log(res)
}

async function login() {
  const res = await authApi.login({
    username: 'username',
    password: 'password',
  })

  if (res?.success) {
    authStore.setToken(res.data)

    await userStore.getUser()
  }
}
</script>

<template>
  <div>
    <div>
      <button @click="login">
        login
      </button>
    </div>

    <div>
      <button @click="user1">
        user1
      </button>
    </div>

    <div>
      <button @click="user2">
        user2
      </button>
    </div>

    <div>
      <button @click="user3">
        user3
      </button>
    </div>

    <!-- 企业站首页内容 -->
    <!-- 产品展示区 -->
    <NuxtImg
      src="/product/main.jpg"
      alt="XX核心产品 - XX科技"
      width="1200"
      height="600"
    />
  </div>
</template>

<style lang="scss" scoped></style>
