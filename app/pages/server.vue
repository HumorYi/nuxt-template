<script setup lang="ts">
async function getHello() {
  const { data } = await useFetch('/api/hello', { query: { name: 'Nuxt' } })

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function getHelloName() {
  const { data } = await useFetch('/api/hello/nuxt')

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function getHelloSlug() {
  const { data } = await useFetch('/api/hello/test/foo')

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function postHello() {
  const { data } = await useFetch('/api/hello', {
    method: 'POST',
    body: {
      name: 'Nuxt',
    },
  })

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function postValidation() {
  const { data } = await useFetch('/api/validation/a')

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function getCookie() {
  const { data } = await useFetch('/api/cookies')

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function forward() {
  const { data } = await useFetch('/api/forward')

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function backgroundTask() {
  const { data } = await useFetch('/api/background-task')

  if (data.value?.success) {
    console.log(data.value.data)
  }
}

async function getStream() {
  const { data } = await useFetch('/api/stream')

  console.log(data.value)
}

async function getRedirect() {
  const { data } = await useFetch('/api/redirect')

  console.log(data.value)
}
</script>

<template>
  <div class="server-api">
    <div>
      <button @click="getRedirect">
        getRedirect
      </button>
    </div>

    <div>
      <button @click="getStream">
        getStream
      </button>
    </div>

    <div>
      <button @click="backgroundTask">
        backgroundTask
      </button>
    </div>

    <div>
      <button @click="getHello">
        getHello
      </button>
    </div>

    <div>
      <button @click="getHelloName">
        getHelloName
      </button>
    </div>

    <div>
      <button @click="getHelloSlug">
        getHelloSlug
      </button>
    </div>

    <div>
      <button @click="postHello">
        postHello
      </button>
    </div>

    <div>
      <button @click="postValidation">
        postValidation
      </button>
    </div>

    <div>
      <button @click="getCookie">
        getCookie
      </button>
    </div>

    <div>
      <button @click="forward">
        forward
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
