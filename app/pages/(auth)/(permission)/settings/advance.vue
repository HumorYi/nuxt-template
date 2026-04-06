<script setup lang="ts">
const routes = [
  { path: '/settings/advance', text: 'home' },
  { path: '/settings/advance/base', text: 'base' },
].filter(item => usePermission(item.path))
</script>

<template>
  <div class="advance">
    settings advance

    <ul>
      <li v-for="item in routes" :key="item.path">
        <NuxtLink :to="item.path">
          {{ item.text }}
        </NuxtLink>
      </li>
    </ul>

    <NuxtPage />
  </div>
</template>

<style lang="scss" scoped></style>
