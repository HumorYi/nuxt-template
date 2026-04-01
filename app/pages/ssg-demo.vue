<script setup lang="ts">
// SSG 配置：在构建时生成静态页面
const { data, error, status } = useFetch('/api/ssg-content')
</script>

<template>
  <div class="ssg-demo">
    <h1>{{ $t('ssg.title') }}</h1>
    <div v-if="error">
      <p class="text-red-500">
        {{ error.message }}
      </p>
    </div>
    <div v-if="status === 'pending'">
      <p>{{ $t('loading.loading') }}</p>
    </div>
    <div v-else-if="data">
      <div class="static-content">
        <h2>{{ $t('ssg.contentTitle') }}</h2>
        <p>{{ $t('ssg.contentDescription') }}</p>
        <ul>
          <li>{{ $t('ssg.benefit1') }}</li>
          <li>{{ $t('ssg.benefit2') }}</li>
          <li>{{ $t('ssg.benefit3') }}</li>
        </ul>
      </div>
      <div class="generated-info">
        <p class="text-gray-500">
          {{ $t('ssg.generatedAt', { time: data.generatedAt }) }}
        </p>
        <p class="mt-2 text-gray-500">
          {{ $t('ssg.note') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ssg-demo {
  margin: 0 auto;
  padding: 2rem;
  max-width: 800px;
}

.static-content {
  padding: 1.5rem;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgb(0, 0, 0, 10%);
}

.generated-info {
  margin-top: 2rem;
}
</style>
