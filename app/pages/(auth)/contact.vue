<script setup lang="ts">
const authPageLang = useAuthPageLang('contact')

useSeoMeta({
  title: 'site.contactTitle',
  description: 'site.contactDescription',
  keywords: 'site.contactKeywords',
})
</script>

<template>
  <div class="contact bg-d">
    {{ authPageLang('desc') }}
  </div>
</template>

<style lang="scss" scoped>
.contact {
  width: 200px;
  height: 200px;
  background-color: vars.$bgColor-container;
}
</style>
