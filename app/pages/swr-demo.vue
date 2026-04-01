<script setup lang="ts">
// SWR 配置：Stale While Revalidate 模式
const focus = ref(false)
// const { data, error, status, refresh } = await useFetch('/api/swr-content-redis', { query: { focus: focus.value } })
const { data, error, status, refresh } = await useFetch('/api/swr-content', { query: { focus: focus.value } })

// 手动刷新数据
async function refreshData() {
  focus.value = true

  await refresh()
}
</script>

<template>
  <div class="swr-demo">
    <h1>{{ $t('swr.title') }}</h1>
    <div v-if="error">
      <p class="text-red-500">
        {{ error.message }}
      </p>
    </div>

    <div v-if="status === 'pending'">
      <p>{{ $t('loading.loading') }}</p>
    </div>
    <div v-else-if="data">
      <div class="swr-content">
        <h2>{{ $t('swr.contentTitle') }}</h2>
        <p>{{ $t('swr.contentDescription') }}</p>
        <ul>
          <li>{{ $t('swr.benefit1') }}</li>
          <li>{{ $t('swr.benefit2') }}</li>
          <li>{{ $t('swr.benefit3') }}</li>
        </ul>
      </div>
      <div class="swr-actions">
        <button class="rounded bg-blue-500 px-4 py-2 text-white" @click="refreshData">
          {{ $t('swr.refresh') }}
        </button>
      </div>
      <div class="swr-info">
        <p class="text-gray-500">
          {{ $t('swr.lastUpdated', { time: data.data.lastUpdated }) }}
        </p>
        <p class="mt-2 text-gray-500">
          {{ $t('swr.note') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swr-demo {
  margin: 0 auto;
  padding: 2rem;
  max-width: 800px;
}

.swr-content {
  padding: 1.5rem;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgb(0, 0, 0, 10%);
}

.swr-actions {
  margin-top: 1.5rem;
}

.swr-info {
  margin-top: 2rem;
}
</style>
