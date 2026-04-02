<script lang="ts" setup></script>

<template>
  <div>
    settings

    <ul>
      <li>
        <nav>
          <NuxtLinkPermission to="/settings">
            home
          </NuxtLinkPermission>
        </nav>
      </li>
      <li>
        <nav>
          <NuxtLinkPermission to="/settings/base">
            base
          </NuxtLinkPermission>
        </nav>
      </li>
      <li>
        <nav>
          <NuxtLinkPermission to="/settings/advance">
            advance
          </NuxtLinkPermission>
        </nav>
      </li>
    </ul>

    <NuxtPage />
  </div>
</template>

<style lang="scss" scoped></style>
