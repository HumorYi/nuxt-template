<script setup lang="ts">
const pageLang = useLangPage('forbidden')
</script>

<template>
  <BackHome :text="pageLang('noPermission')" />
</template>

<style lang="scss" scoped></style>
