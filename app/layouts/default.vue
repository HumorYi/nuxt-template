<script setup lang="ts">
const layoutLang = useLayoutLang('default')
</script>

<template>
  <div>
    <header>{{ layoutLang('header') }}</header>

    <slot />

    <footer>{{ layoutLang('footer') }}</footer>
  </div>
</template>
