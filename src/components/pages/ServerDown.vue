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

<script>
// Module scope: shared with the copies App.vue mounts of this page.
let isRedirecting = false
</script>

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
  // The redirect runs the / guard, whose loading screen mounts this page
  // again while the navigation waits: a check from that copy would push the
  // redirect anew and restart the guard, once more on every answer.
  if (isRedirecting) return
  try {
    await auth.isServerLoggedIn()
  } catch {
    // Server still down: stay on this page.
    return
  }
  // A copy mounted during a navigation it did not start answers after the
  // app has moved on, and must not navigate.
  if (route.name !== 'server-down') return
  isRedirecting = true
  try {
    await router.push(route.query.redirect || '/')
  } finally {
    isRedirecting = false
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
