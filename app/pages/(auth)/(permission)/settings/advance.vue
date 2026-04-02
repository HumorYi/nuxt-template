<script setup lang="ts"></script>

<template>
  <div class="advance">
    settings advance

    <ul>
      <li>
        <nav>
          <NuxtLinkPermission to="/settings/advance">
            home
          </NuxtLinkPermission>
        </nav>
      </li>
      <li>
        <nav>
          <NuxtLinkPermission to="/settings/advance/base">
            base
          </NuxtLinkPermission>
        </nav>
      </li>
    </ul>

    <NuxtPage />
  </div>
</template>

<style lang="scss" scoped></style>
