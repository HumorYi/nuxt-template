<script lang="ts" setup>
import { registerApiToast } from '@/plugins/api'

registerApiToast((msg) => {
  console.log(msg)
})
</script>

<template>
  <CustomLoading />

  <Suspense>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Suspense>
</template>

<style scoped lang="scss"></style>
