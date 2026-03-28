<script setup lang="ts">
const componentLang = useComponentLang('test.CustomUse')
</script>

<template>
  <div class="custom-use">
    {{ componentLang('title') }}
  </div>
</template>

<style lang="scss" scoped></style>