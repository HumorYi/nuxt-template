<script lang="ts" setup>
const authApi = useAuthApi()
const authStore = useAuthStore()
const userStore = useUserStore()

async function login() {
  const res = await authApi.login({
    username: 'username',
    password: 'password',
  })

  if (res?.success) {
    authStore.setToken(res.data)

    await userStore.getUser()

    authStore.toLoginRedirect()
  }
}
</script>

<template>
  <div>
    <div>
      <button @click="login">
        login
      </button>
    </div>

    <div class="m-10">
      <NuxtLink to="/hr">
        hr
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
