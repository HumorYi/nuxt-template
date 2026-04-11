<script setup>
const config = useRuntimeConfig()
const siteLang = useLangSite()

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
</script>

<template>
  <div class="bg-d">
    <NuxtLink to="/login">
      login
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped></style>
