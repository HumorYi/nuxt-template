<script setup lang="ts">
const langPage = useLangPage('forbidden')
</script>

<template>
  <BackHome :text="langPage('noPermission')" />
</template>

<style lang="scss" scoped></style>
