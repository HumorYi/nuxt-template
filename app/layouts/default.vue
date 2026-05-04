<script setup lang="ts">
const langLayout = useLangLayout('default')
</script>

<template>
  <div>
    <header>{{ langLayout('header') }}</header>

    <slot />

    <footer>{{ langLayout('footer') }}</footer>
  </div>
</template>
