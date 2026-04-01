<script setup>
const config = useRuntimeConfig()
const siteLang = useSiteLang()

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': siteLang('name'),
        'legalName': siteLang('legalName'),
        'url': config.public.site.url,
        'logo': config.public.site.logo,
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'telephone': '400',
            'contactType': 'customer service',
            'areaServed': 'CN',
            'availableLanguage': 'zh-CN',
          },
        ],
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': siteLang('address'),
          'addressLocality': siteLang('city'),
          'postalCode': 'XXXXXX',
          'addressCountry': 'CN',
        },
      }),
    },
  ],
})

useSeoMeta({
  title: 'site.pageTitle',
})

useSchemaOrg([
  {
    '@type': 'Article',
    'headline': siteLang('headline'),
    'author': [{ '@type': 'Person', 'name': siteLang('author') }],
    'datePublished': '2026-03-24',
  },
])

const authApi = useAuthApi()
const userApi = useUserApi()
const authStore = useAuthStore()
const userStore = useUserStore()

// const router = useRouter()
// console.log(router.getRoutes())

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

    <NuxtImg
      src="/product/main.jpg"
      :alt="siteLang('coreProductAlt')"
      width="1200"
      height="600"
    />
  </div>
</template>

<style lang="scss" scoped></style>
