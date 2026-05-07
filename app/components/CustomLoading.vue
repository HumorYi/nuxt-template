<script lang="ts" setup>
const langComponent = useLangComponent()
const loadingStore = useLoadingStore()
</script>

<template>
  <div
    v-if="loadingStore.state.global"
    class="global-loading"
  >
    {{ langComponent('global') }}
  </div>

  <div
    v-if="loadingStore.state.test"
    class="global-loading"
  >
    {{ langComponent('test') }}
  </div>
</template>

<style>
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
