<script setup lang="ts">
const { locale, locales,setLocale } = useI18n()
</script>

<template>
  <div class="language-switcher">
    <button
      v-for="loc in locales"
      :key="loc.code"
      :class="{ active: locale === loc.code }"
      class="locale-item"
      @click="setLocale(loc.code)"
    >
      {{ loc.name }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.language-switcher {
  display: flex;
  gap: 8px;
  align-items: center;

  .locale-item {
    padding: 4px 12px;
    font-size: 14px;
    border-radius: 4px;
    text-decoration: none;
    color: var(--text-color);
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      background-color: var(--hover-bg);
    }

    &.active {
      color: white;
      background-color: var(--primary-color);
    }
  }
}
</style>
