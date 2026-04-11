<script setup lang="ts">
import { useLangUserPage } from '~/composables/useLang'

const userLang = useLangUserPage()

const routes = [
  { path: '/user', text: userLang('backToUserHome') },
  { path: '/user/base', text: userLang('basicInfo') },
  { path: '/user/advance', text: userLang('advancedSettings') },
].filter(item => usePermission(item.path))
</script>

<template>
  <div class="index">
    <h2>{{ userLang('userCenterParent') }}</h2>

    <!-- 子路由导航 -->
    <ul>
      <li v-for="item in routes" :key="item.path">
        <NuxtLink :to="item.path">
          {{ item.text }}
        </NuxtLink>
      </li>
    </ul>

    <!-- 🌟 子路由内容会渲染在这个 NuxtPage 标签位置 -->
    <div
      class="child-route-container"
      style="margin-top: 20px; padding: 10px; border: 1px solid #eee"
    >
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.index {
  padding: 20px;
  ul {
    padding: 0;
    list-style: none;
    > li {
      margin: 10px 0;
      a {
        text-decoration: none;
        color: #333;
        &.nuxt-link-active {
          font-weight: bold;

          // 激活态样式（可选）
          color: #409eff;
        }
      }
    }
  }
  .child-route-container {
    background: #f9f9f9;
  }
}
</style>
