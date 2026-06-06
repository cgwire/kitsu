<template>
  <div class="onion-wrapper">
    <button
      type="button"
      class="button onion-trigger"
      :class="{ active: isOn }"
      :title="$t('playlists.actions.onion_skin')"
      @click="togglePalette"
    >
      <layers-icon class="icon" />
    </button>
    <div v-show="isOpen" class="onion-palette">
      <span class="onion-label">{{ $t('playlists.actions.onion_skin') }}</span>
      <div class="onion-options">
        <button
          type="button"
          class="onion-option"
          :class="{ active: !isOn }"
          :title="$t('playlists.actions.onion_skin_off')"
          @click="onPicked(false, frames)"
        >
          {{ $t('playlists.actions.onion_skin_off') }}
        </button>
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="onion-option"
          :class="{ active: isOn && frames === n }"
          :title="`${n}`"
          @click="onPicked(true, n)"
        >
          {{ n }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LayersIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps({
  frames: {
    type: Number,
    default: 2
  },
  isOn: {
    type: Boolean,
    default: false
  },
  modelValue: {
    // When the parent passes a Boolean here, the picker is
    // controlled — open/close decisions go through update:model-value
    // so siblings can be coordinated (one panel open at a time).
    // Leaving it undefined falls back to internal state.
    type: Boolean,
    default: undefined
  }
})

const emit = defineEmits(['change', 'update:model-value'])

const internalOpen = ref(false)
const isControlled = () => props.modelValue !== undefined
const isOpen = computed(() =>
  isControlled() ? props.modelValue : internalOpen.value
)

const setOpen = value => {
  if (isControlled()) emit('update:model-value', value)
  else internalOpen.value = value
}

const togglePalette = () => {
  setOpen(!isOpen.value)
}

const onPicked = (enabled, frames) => {
  emit('change', { enabled, frames })
  setOpen(false)
}
</script>

<style lang="scss" scoped>
.onion-wrapper {
  position: relative;
  display: inline-flex;
}

// The annotation bar (.buttons :deep(.button)) already supplies the
// background / hover / active icon colour; we only add the pressed inset
// shadow so the active state matches the other toggles (ButtonSimple).
.onion-trigger.active {
  box-shadow: inset 0 0 2px 2px var(--box-shadow);
}

.onion-trigger .icon {
  height: 1.2rem;
  width: 1.2rem;
}

.onion-palette {
  background-color: $dark-grey-light;
  border-radius: 5px;
  bottom: calc(100% + 0.2rem);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  left: 50%;
  padding: 0.5rem;
  position: absolute;
  transform: translateX(-50%);
  z-index: 900;
}

.preview .onion-palette {
  background-color: $dark-grey;
}

.onion-label {
  color: $light-grey-2;
  font-size: 0.7rem;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
}

.onion-options {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
}

.onion-option {
  background: transparent;
  border: 0;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  min-width: 1.6rem;
  padding: 0.3rem 0.4rem;
  transition: background-color 0.15s ease;
}

.onion-option:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.onion-option.active {
  background-color: $dark-grey-strong;
  color: $white;
}
</style>
