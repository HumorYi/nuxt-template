<script setup lang="ts">
const componentLang = useLangComponent('CustomTest')
</script>

<template>
  <div class="custom-test">
    {{ componentLang('title') }}
  </div>
</template>

<style lang="scss" scoped></style>
