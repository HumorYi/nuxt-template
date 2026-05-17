<script setup lang="ts">
const langLayout = useLangLayout()
</script>

<template>
  <div>
    <header>
      <section>{{ langLayout('header') }}</section>

      <LanguageSwitcher />
    </header>

    <slot />

    <footer>{{ langLayout('footer') }}</footer>
  </div>
</template>
