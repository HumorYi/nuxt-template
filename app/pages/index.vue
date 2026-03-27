<script setup>
const { t } = useI18n()

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': t('company.name'),
        'legalName': t('company.legalName'),
        'url': t('company.url'),
        'logo': t('company.logo'),
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
          'streetAddress': t('company.address'),
          'addressLocality': t('company.city'),
          'postalCode': 'XXXXXX',
          'addressCountry': 'CN',
        },
      }),
    },
  ],
})

useSeoMeta({
  title: 'company.pageTitle',
})

useSchemaOrg([
  {
    '@type': 'Article',
    'headline': t('company.headline'),
    'author': [{ '@type': 'Person', 'name': t('company.author') }],
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

    <!-- {{ $t('company.enterpriseContent') }} -->
    <!-- {{ $t('company.productDisplay') }} -->
    <NuxtImg
      src="/product/main.jpg"
      :alt="$t('company.coreProductAlt')"
      width="1200"
      height="600"
    />
  </div>
</template>

<style lang="scss" scoped></style>
