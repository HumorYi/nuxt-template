<script lang="ts" setup>
import Member from './_components/Member.vue'
import Panel from './_components/Panel.vue'

useSeoMeta({
  title: 'page.login',
})

const authApi = useAuthApi()
const authStore = useAuthStore()
const userStore = useUserStore()

const showPanel = ref(false)
const showMember = ref(false)

function togglePanel() {
  showPanel.value = !showPanel.value
}

function toggleMember() {
  showMember.value = !showMember.value
}

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

    <div>
      <button @click="togglePanel">
        togglePanel
      </button>
    </div>

    <div>
      <button @click="toggleMember">
        toggleMember
      </button>
    </div>

    <Panel v-if="showPanel" />
    <Member v-if="showMember" />

    <div class="m-10">
      <NuxtLink to="/hr">
        hr
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
