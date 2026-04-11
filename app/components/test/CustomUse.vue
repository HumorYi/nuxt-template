<script setup lang="ts">
const componentLang = useLangComponent('test.CustomUse')
</script>

<template>
  <div class="custom-use">
    {{ componentLang('title') }}
  </div>
</template>

<style lang="scss" scoped></style>