import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const STAGGER_MS = 150
const APPEAR_MS = 400
const HOLD_MS = 300
const FADEOUT_MS = 350
const GAP_MS = 150

export const useSkeletonCycle = countRef => {
  const fadeoutDelayMs = computed(
    () => (countRef.value - 1) * STAGGER_MS + APPEAR_MS + HOLD_MS
  )
  const cycleMs = computed(() => fadeoutDelayMs.value + FADEOUT_MS + GAP_MS)

  const cycle = ref(0)
  let timer = null

  onMounted(() => {
    timer = setInterval(() => {
      cycle.value++
    }, cycleMs.value)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return { cycle, fadeoutDelayMs }
}
