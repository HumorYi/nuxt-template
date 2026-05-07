<script setup lang="ts">
const langLayout = useLangLayout()
</script>

<template>
  <div>
    <header>{{ langLayout('header') }}</header>

    <slot />

    <footer>{{ langLayout('footer') }}</footer>
  </div>
</template>
