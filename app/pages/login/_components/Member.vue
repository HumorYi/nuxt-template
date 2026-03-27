<script setup lang="ts">
const userStore = useUserStore()

async function login() {
  await userStore.getUser()
}

async function init() {
  await login()
}

await init()
</script>

<template>
  <div class="panel">
    panel
  </div>
</template>

<style lang="scss" scoped></style>
