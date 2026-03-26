<script lang="ts" setup></script>

<template>
  <div>
    settings

    <ul>
      <li>
        <nav>
          <NuxtLinkPermissionPermission to="/settings">
            home
          </NuxtLinkPermissionPermission>
        </nav>
      </li>
      <li>
        <nav>
          <NuxtLinkPermissionPermission to="/settings/base">
            base
          </NuxtLinkPermissionPermission>
        </nav>
      </li>
      <li>
        <nav>
          <NuxtLinkPermissionPermission to="/settings/advance">
            advance
          </NuxtLinkPermissionPermission>
        </nav>
      </li>
    </ul>

    <NuxtPage />
  </div>
</template>

<style lang="scss" scoped></style>
