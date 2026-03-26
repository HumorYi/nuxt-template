<script setup lang="ts"></script>

<template>
  <div class="index">
    <h2>用户中心（父路由）</h2>

    <!-- 子路由导航 -->
    <ul>
      <li>
        <NuxtLinkPermission to="/user">
          回到用户首页
        </NuxtLinkPermission>
      </li>
      <li>
        <NuxtLinkPermission to="/user/base">
          基础信息
        </NuxtLinkPermission>
      </li>
      <li>
        <NuxtLinkPermission to="/user/advance">
          高级设置
        </NuxtLinkPermission>
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
