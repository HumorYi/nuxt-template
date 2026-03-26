<script setup lang="ts">
const { title = 'title', borderColor = '#3b82f6' } = defineProps<{
  title?: string
  borderColor?: string
}>()
</script>

<template>
  <div :style="{ borderColor }" class="h-full w-full flex items-start justify-start border-[12px] border-solid bg-gray-50">
    <div class="h-full flex items-start justify-start">
      <div class="h-full w-full flex flex-col justify-between">
        <h1 class="p-20 text-left text-[80px] font-black">
          {{ title }}
        </h1>

        <p class="mb-0 px-20 pb-10 text-2xl font-bold">
          mycoolsite.com
        </p>
      </div>
    </div>
  </div>
</template>
