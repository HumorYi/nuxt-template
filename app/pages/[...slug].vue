<script setup>
useSeoMeta({
  title: '页面不存在 - 404',
})
</script>

<template>
  <div class="py-10 text-center">
    <h1 class="text-3xl font-bold">
      404 页面未找到
    </h1>
    <p class="mt-4">
      你访问的页面不存在，返回首页继续浏览
    </p>
    <button
      class="mt-6 rounded bg-blue-600 px-6 py-2 text-white"
      @click="$router.push('/')"
    >
      返回首页
    </button>
  </div>
</template>

<style lang="scss" scoped></style>
