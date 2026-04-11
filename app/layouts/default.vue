<script setup lang="ts">
const layoutLang = useLangLayout('default')
</script>

<template>
  <div>
    <header>{{ layoutLang('header') }}</header>

    <slot />

    <footer>{{ layoutLang('footer') }}</footer>
  </div>
</template>
