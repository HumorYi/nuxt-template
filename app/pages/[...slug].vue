<script setup>
const pageLang = usePageLang('catchAllRoute')
const commonLang = useCommonLang()
</script>

<template>
  <div class="py-10 text-center">
    <h1 class="text-3xl font-bold">
      {{ pageLang('noFound') }}
    </h1>

    <button
      class="mt-6 rounded bg-blue-600 px-6 py-2 text-white"
      @click="$router.push('/')"
    >
      {{ commonLang('backHome') }}
    </button>
  </div>
</template>

<style lang="scss" scoped></style>
