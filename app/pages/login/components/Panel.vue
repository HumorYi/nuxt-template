<script setup lang="ts">
const authApi = useAuthApi()
const authStore = useAuthStore()

async function login() {
  const res = await authApi.login({
    username: 'username',
    password: 'password',
  })

  if (res?.success) {
    authStore.setToken(res.data)
  }
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
