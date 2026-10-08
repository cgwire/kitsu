<template>
  <div class="server-down page has-text-centered">
    <div class="illustration">
      <img src="@/assets/illustrations/500.png" alt="" />
    </div>
    <h1 class="title">{{ $t('server_down.title') }}</h1>
    <p>
      {{ $t('server_down.text') }}
    </p>
    <p class="retrying">
      {{ $t('server_down.retrying') }}
    </p>
  </div>
</template>

<script>
// Quick checks catch a short outage, like a restart, then one a minute is
// enough.
const FIRST_RETRY_DELAY = 5000
const MAX_RETRY_DELAY = 60000

// Module scope: shared with the copies App.vue mounts of this page, so the
// checks keep slowing down while the / guard sends back here.
let isRedirecting = false
let retryDelay = FIRST_RETRY_DELAY
</script>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import auth from '@/lib/auth'

// Composables
// --------------------------------------------------------------------------

const route = useRoute()
const router = useRouter()

// State
// --------------------------------------------------------------------------

let retryTimer = null
let isChecking = false
let isUnmounted = false

// Functions
// --------------------------------------------------------------------------

const scheduleCheck = () => {
  if (isUnmounted) return
  clearTimeout(retryTimer)
  retryTimer = setTimeout(checkServer, retryDelay)
  retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY)
}

const checkServer = async () => {
  // The redirect runs the / guard, whose loading screen mounts this page
  // again while the navigation waits: a check from that copy would push the
  // redirect anew and restart the guard. Check later, in case the guard
  // sends back here.
  if (isRedirecting) {
    scheduleCheck()
    return
  }
  isChecking = true
  try {
    await auth.isServerLoggedIn()
  } catch {
    // Server still down: stay on this page.
    scheduleCheck()
    return
  } finally {
    isChecking = false
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
  // Sent back here without a new copy: the server went down again.
  if (route.name === 'server-down') scheduleCheck()
}

const checkServerNow = () => {
  if (isChecking) return
  clearTimeout(retryTimer)
  checkServer()
}

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') checkServerNow()
}

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  // A copy mounted during a redirect goes on with the same outage.
  if (!isRedirecting) retryDelay = FIRST_RETRY_DELAY
  window.addEventListener('online', checkServerNow)
  document.addEventListener('visibilitychange', onVisibilityChange)
  checkServer()
})

onBeforeUnmount(() => {
  isUnmounted = true
  clearTimeout(retryTimer)
  window.removeEventListener('online', checkServerNow)
  document.removeEventListener('visibilitychange', onVisibilityChange)
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

.retrying {
  font-size: 1.1em;
}

.title {
  color: var(--text);
  font-weight: bold;
  font-size: 2.4em;
}
</style>
