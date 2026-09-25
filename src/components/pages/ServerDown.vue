<template>
  <div class="server-down page has-text-centered">
    <div class="illustration">
      <img src="@/assets/illustrations/500.png" alt="" />
    </div>
    <h1 class="title">{{ $t('server_down.title') }}</h1>
    <p>
      {{ $t('server_down.text') }}
    </p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import auth from '@/lib/auth'

// Composables
// --------------------------------------------------------------------------

const route = useRoute()
const router = useRouter()

// Lifecycle
// --------------------------------------------------------------------------

onMounted(async () => {
  try {
    await auth.isServerLoggedIn()
    // App.vue mounts this page again while the redirect loads its data:
    // that copy answers after the app has moved on, and must not navigate.
    if (route.name === 'server-down') router.push(route.query.redirect || '/')
  } catch {
    // Server still down: stay on this page.
  }
})
</script>

<style lang="scss" scoped>
.illustration {
  max-width: 1000px;
  margin: auto;
  img {
    border-radius: 3rem;
    margin-bottom: 2rem;
  }
}

p {
  font-size: 1.3em;
  padding-bottom: 1em;

  a {
    text-decoration: underline;
  }
}

.title {
  color: var(--text);
  font-weight: bold;
  font-size: 2.4em;
}
</style>
