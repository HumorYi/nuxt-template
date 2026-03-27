<script lang="ts" setup>

const loadingStore = useLoadingStore()
</script>

<template>
  <div>
    <div
      v-if="loadingStore.state.global"
      class="global-loading"
    >
      {{ $t('loading.global') }}
    </div>

    <div
      v-if="loadingStore.state.test"
      class="global-loading"
    >
      {{ $t('loading.test') }}
    </div>

    <LanguageSwitcher />

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
</style>
