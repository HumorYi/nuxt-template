<script setup lang="ts"></script>

<template>
  <div class="advance">
    user advance

    <ul>
      <li>
        <nav>
          <NuxtLinkPermission to="/user/advance">
            home
          </NuxtLinkPermission>
        </nav>
      </li>
      <li>
        <nav>
          <NuxtLinkPermission to="/user/advance/base">
            base
          </NuxtLinkPermission>
        </nav>
      </li>
    </ul>

    <NuxtPage />
  </div>
</template>

<style lang="scss" scoped></style>
