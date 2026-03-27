<script setup lang="ts">
useSeoMeta({
  title: 'page.forbiddenAccess',
  description: 'page.noPermissionToAccess',
})
</script>

<template>
  <div class="py-10 text-center">
    <h1 class="text-3xl font-bold">
      {{ $t('page.forbiddenAccess403') }}
    </h1>
    <p class="mt-4">
      {{ $t('page.noPermissionToView') }}
    </p>
    <button
      class="mt-6 rounded bg-blue-600 px-6 py-2 text-white"
      @click="$router.push('/')"
    >
      {{ $t('error.backHome') }}
    </button>
  </div>
</template>

<style lang="scss" scoped></style>
