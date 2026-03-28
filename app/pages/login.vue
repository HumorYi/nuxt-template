<script lang="ts" setup>
const pageLang = usePageLang('login')
const pageMessageLang = usePageMessageLang(pageLang)

const authApi = useAuthApi()
const authStore = useAuthStore()
const userStore = useUserStore()

async function login() {
  const res = await authApi.login({
    username: 'username',
    password: 'password',
  })

  const success = res?.success

  if (success) {
    authStore.setToken(res.data)

    await userStore.getUser()

    authStore.toLoginRedirect()
  }

  console.log(pageMessageLang(success ? 'loginSuccess' : 'loginFailed'))
}
</script>

<template>
  <div>
    <div>
      <button @click="login">
        {{ pageLang('login') }}
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
