<script lang="ts" setup>
import { useLoadingLang } from './composables/useLang'

const loadingLang = useLoadingLang()
const loadingStore = useLoadingStore()
</script>

<template>
  <div>
    <div
      v-if="loadingStore.state.global"
      class="global-loading"
    >
      {{ loadingLang('global') }}
    </div>

    <div
      v-if="loadingStore.state.test"
      class="global-loading"
    >
      {{ loadingLang('test') }}
    </div>

    <div class="lang">
      <LanguageSwitcher />
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style scoped>
  .global-loading {
    /* position: fixed; */
    inset: 0;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: white;
    background: rgb(0, 0, 0, 50%);
    user-select: none;
  }

  .lang {
    position: fixed;
    top: 10px;
    right: 10px;
  }
</style>
