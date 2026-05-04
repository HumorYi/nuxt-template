<script setup lang="ts">
const langSite = useLangSite()
const userStore = useUserStore()
const authStore = useAuthStore()

useHead({
  script: [
    {
      type: 'application/ld+json',
    },
  ],
})

useSeoMeta({
  title: 'site.pageTitle',
})

useSchemaOrg([
  {
    '@type': 'Article',
    'headline': langSite('headline'),
    'author': [{ '@type': 'Person', 'name': langSite('author') }],
    'datePublished': '2026-03-24',
  },
])
</script>

<template>
  <div class="bg-d">
    <button v-if="userStore.isLogin" @click="authStore.logout">
      logout
    </button>
    <NuxtLink v-else to="/login">
      login
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped></style>
