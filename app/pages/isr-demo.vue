<script setup lang="ts">
// ISR 配置：每 60 秒重新生成页面
const { data, error, status } = useFetch('/api/isr-content')
</script>

<template>
  <div class="isr-demo">
    <h1>{{ $t('isr.title') }}</h1>
    <div v-if="error">
      <p class="text-red-500">
        {{ error.message }}
      </p>
    </div>

    <div v-if="status === 'pending'">
      <p>{{ $t('loading.loading') }}</p>
    </div>
    <div v-else-if="data">
      <div class="isr-content">
        <h2>{{ $t('isr.contentTitle') }}</h2>
        <p>{{ $t('isr.contentDescription') }}</p>
        <ul>
          <li>{{ $t('isr.benefit1') }}</li>
          <li>{{ $t('isr.benefit2') }}</li>
          <li>{{ $t('isr.benefit3') }}</li>
        </ul>
      </div>
      <div class="isr-info">
        <p class="mt-2 text-gray-500">
          {{ $t('isr.dataUpdatedAt', { time: data.updatedAt }) }}
        </p>
        <p class="mt-2 text-gray-500">
          {{ $t('isr.note') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.isr-demo {
  margin: 0 auto;
  padding: 2rem;
  max-width: 800px;
}

.isr-content {
  padding: 1.5rem;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgb(0, 0, 0, 10%);
}

.isr-info {
  margin-top: 2rem;
}
</style>
