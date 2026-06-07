import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

const formatTime = seconds => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export const useMediaPlayer = mediaRef => {
  // State
  const isPlaying = ref(false)
  const isMuted = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  // Computed
  const progress = computed(() =>
    duration.value ? currentTime.value / duration.value : 0
  )
  const formattedTime = computed(
    () => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`
  )

  // Event handlers
  const onPlay = () => (isPlaying.value = true)
  const onPause = () => (isPlaying.value = false)
  const onEnded = () => (isPlaying.value = false)
  const onTimeUpdate = () => {
    currentTime.value = mediaRef.value?.currentTime || 0
  }
  const onLoadedMetadata = () => {
    duration.value = mediaRef.value?.duration || 0
  }

  // Controls
  const togglePlay = () => {
    const el = mediaRef.value
    if (!el) return
    if (el.paused) {
      const playing = el.play()
      if (playing?.catch) playing.catch(() => {})
    } else {
      el.pause()
    }
  }

  const seek = ratio => {
    const el = mediaRef.value
    if (!el || !duration.value || !Number.isFinite(ratio)) return
    el.currentTime = Math.max(0, Math.min(1, ratio)) * duration.value
  }

  const toggleMute = () => {
    const el = mediaRef.value
    if (!el) return
    el.muted = !el.muted
    isMuted.value = el.muted
  }

  // Wiring
  const bind = () => {
    const el = mediaRef.value
    if (!el) return
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('loadedmetadata', onLoadedMetadata)
    isMuted.value = el.muted
    if (el.readyState >= 1) duration.value = el.duration || 0
  }

  const unbind = () => {
    const el = mediaRef.value
    if (!el) return
    el.removeEventListener('play', onPlay)
    el.removeEventListener('pause', onPause)
    el.removeEventListener('ended', onEnded)
    el.removeEventListener('timeupdate', onTimeUpdate)
    el.removeEventListener('loadedmetadata', onLoadedMetadata)
  }

  // Lifecycle (guarded so the composable is callable from tests too)
  if (getCurrentInstance()) {
    onMounted(bind)
    onBeforeUnmount(unbind)
  }

  return {
    isPlaying,
    isMuted,
    currentTime,
    duration,
    progress,
    formattedTime,
    togglePlay,
    seek,
    toggleMute,
    bind,
    unbind
  }
}
