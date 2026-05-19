import { computed, ref } from 'vue'

import preferences from '@/lib/preferences'

const STORAGE_KEY = 'desktop-notifications:enabled'

// Per-state keys so dismissing the default banner doesn't suppress the denied one.
const BANNER_DISMISSED_KEYS = {
  default: 'desktop-notifications:banner-dismissed-default',
  denied: 'desktop-notifications:banner-dismissed-denied'
}

// 30s timeout: browsers don't guarantee when the permission dialog appears.
const PERMISSION_REQUEST_TIMEOUT_MS = 30000

const isSupported =
  typeof window !== 'undefined' && typeof window.Notification !== 'undefined'

const preferenceEnabled = ref(
  isSupported ? preferences.getBoolPreference(STORAGE_KEY, false) : false
)
const permission = ref(isSupported ? window.Notification.permission : 'denied')

const readBannerDismissed = () => {
  const key = BANNER_DISMISSED_KEYS[permission.value]
  return key ? preferences.getBoolPreference(key, false) : false
}

const bannerDismissed = ref(isSupported ? readBannerDismissed() : false)

const isActive = computed(
  () => isSupported && preferenceEnabled.value && permission.value === 'granted'
)

const shouldShowBanner = computed(
  () => isSupported && permission.value !== 'granted' && !bannerDismissed.value
)

const dismissBanner = () => {
  bannerDismissed.value = true
  const key = BANNER_DISMISSED_KEYS[permission.value]
  if (key) preferences.setBoolPreference(key, true)
}

// Browsers don't push permission changes from site settings, so we re-poll.
// Clearing the preference on downgrade forces an explicit re-grant.
const syncPermission = () => {
  if (!isSupported) return
  const next = window.Notification.permission
  if (next === permission.value) return
  permission.value = next
  bannerDismissed.value = readBannerDismissed()
  if (next !== 'granted' && preferenceEnabled.value) {
    preferenceEnabled.value = false
    preferences.setBoolPreference(STORAGE_KEY, false)
  }
}

if (isSupported && typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncPermission()
  })
  // Older Firefox throws synchronously from permissions.query('notifications').
  try {
    navigator.permissions
      ?.query({ name: 'notifications' })
      .then(status => status.addEventListener('change', syncPermission))
      .catch(() => {})
  } catch {
    // unsupported permission name — visibility resync covers us
  }
  // Cross-tab sync: `storage` only fires in other tabs, never loops back.
  window.addEventListener('storage', event => {
    if (event.storageArea !== localStorage) return
    if (event.key === STORAGE_KEY) {
      preferenceEnabled.value = event.newValue === 'true'
      return
    }
    const dismissKey = BANNER_DISMISSED_KEYS[permission.value]
    if (event.key === dismissKey) {
      bannerDismissed.value = event.newValue === 'true'
    }
  })
}

const showNotification = ({ title, body, icon, tag, onClick } = {}) => {
  if (!isActive.value || !title) return null
  try {
    const notification = new window.Notification(title, { body, icon, tag })
    if (onClick) {
      notification.onclick = event => {
        event.preventDefault()
        window.focus()
        onClick()
        notification.close()
      }
    }
    return notification
  } catch (err) {
    console.error(err)
    return null
  }
}

// Multi-tab dedup for the same socket event: only the lock holder runs `work`.
const withDesktopNotificationLock = (id, work) => {
  if (!navigator.locks?.request) return work()
  return navigator.locks.request(
    `kitsu:desktop-notification:${id}`,
    { ifAvailable: true },
    lock => lock && work()
  )
}

// Fires `confirmationPayload` once on the inactive → active transition.
const setPreferenceEnabled = async (value, confirmationPayload) => {
  if (!isSupported) return false
  // JS can't re-prompt once denied — bail out without touching state.
  if (value && permission.value === 'denied') return false
  const wasActive = isActive.value
  if (value && permission.value === 'default') {
    let timeoutId
    try {
      const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Notification permission request timeout')),
          PERMISSION_REQUEST_TIMEOUT_MS
        )
      })
      permission.value = await Promise.race([
        window.Notification.requestPermission(),
        timeoutPromise
      ])
    } catch (err) {
      console.error(err)
      permission.value = window.Notification.permission
    } finally {
      clearTimeout(timeoutId)
    }
  }
  preferenceEnabled.value = value && permission.value === 'granted'
  preferences.setBoolPreference(STORAGE_KEY, preferenceEnabled.value)
  const becameActive = !wasActive && isActive.value
  if (becameActive && confirmationPayload) {
    showNotification(confirmationPayload)
  }
  return becameActive
}

export const useDesktopNotifications = () => ({
  isSupported,
  permission,
  preferenceEnabled,
  isActive,
  shouldShowBanner,
  dismissBanner,
  setPreferenceEnabled,
  showNotification,
  withDesktopNotificationLock
})
