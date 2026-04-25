<script setup lang="ts">
const routes = [
  { path: '/user/advance', text: 'home' },
  { path: '/user/advance/base', text: 'base' },
].filter(item => usePermissionPage(item.path))
</script>

<template>
  <div class="advance">
    user advance

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
