<script setup lang="ts">
const componentLang = useComponentLang('CustomTest')
</script>

<template>
  <div class="custom-test">
    {{ componentLang('title') }}
  </div>
</template>

<style lang="scss" scoped></style>
