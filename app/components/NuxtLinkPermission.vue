<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ to: RouteLocationRaw }>()

const userStore = useUserStore()
</script>

<template>
  <NuxtLink
    v-if="userStore.hasRoutePermission(to)"
    :to="to"
  >
    <slot />
  </NuxtLink>
</template>

<style lang="scss" scoped></style>
