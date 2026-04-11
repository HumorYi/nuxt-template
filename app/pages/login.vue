<script lang="ts" setup>
const pageLang = useLangPage('login')
const authStore = useAuthStore()

async function login() {
  await authStore.login({
    username: 'username',
    password: 'password',
  })
}
</script>

<template>
  <div>
    <button @click="login">
      {{ pageLang('login') }}
    </button>

    <div style=" width: 1000px;height: 1000px; background-color: red;" />
  </div>
</template>

<style lang="scss" scoped></style>
