<script setup lang="ts">
// SSR 配置：在服务端渲染页面
const { data, error, status } = useFetch('/api/ssr-content')
</script>

<template>
  <div class="ssr-demo">
    <h1>{{ $t('ssr.title') }}</h1>
    <div v-if="error">
      <p class="text-red-500">
        {{ error.message }}
      </p>
    </div>

    <div v-if="status === 'pending'">
      <p>{{ $t('loading.loading') }}</p>
    </div>
    <div v-else-if="data">
      <div class="dynamic-content">
        <h2>{{ $t('ssr.contentTitle') }}</h2>
        <p>{{ $t('ssr.contentDescription') }}</p>
        <ul>
          <li>{{ $t('ssr.benefit1') }}</li>
          <li>{{ $t('ssr.benefit2') }}</li>
          <li>{{ $t('ssr.benefit3') }}</li>
        </ul>
      </div>
      <div class="server-info">
        <p class="text-gray-500">
          {{ $t('ssr.renderedAt', { time: data.renderedAt }) }}
        </p>
        <p class="mt-2 text-gray-500">
          {{ $t('ssr.note') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ssr-demo {
  margin: 0 auto;
  padding: 2rem;
  max-width: 800px;
}

.dynamic-content {
  padding: 1.5rem;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgb(0, 0, 0, 10%);
}

.server-info {
  margin-top: 2rem;
}
</style>
