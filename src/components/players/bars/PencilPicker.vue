<template>
  <div class="pencil-wrapper">
    <button
      type="button"
      class="pencil-picker"
      :title="$t(`playlists.actions.annotation_${pencil}`)"
      :class="[pencil]"
      @click="togglePalette"
    />
    <div v-show="isOpen" class="pencil-palette">
      <label
        :key="pencil"
        :title="$t(`playlists.actions.annotation_${pencil}`)"
        :class="[pencil]"
        v-for="pencil in sizes"
      >
        <input type="radio" :value="pencil" @click="onPencilPicked(pencil)" />
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  pencil: {
    type: String
  },
  modelValue: {
    // When the parent passes a Boolean here, the picker is
    // controlled — open/close decisions go through update:model-value
    // so siblings can be coordinated (one panel open at a time).
    // Leaving it undefined falls back to internal state.
    type: Boolean,
    default: undefined
  },
  sizes: {
    type: Array
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

const onPencilPicked = width => {
  emit('change', width)
  setOpen(false)
}
</script>

<style lang="scss" scoped>
.pencil-wrapper {
  position: relative;
  display: inline-flex;
}
.pencil-picker {
  padding: 0;
  background-color: transparent;
  cursor: pointer;
}
.pencil-picker {
  background-color: transparent;
  min-width: 1.5rem;
}
.pencil-picker::before,
.pencil-palette label::before {
  display: block;
  content: '';
  margin: 0.4rem auto;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: $light-grey;
}

.pencil-picker.huge::before,
.pencil-palette label.huge::before {
  margin: 0.25rem auto;
  width: 1.3rem;
  height: 1.3rem;
}

.pencil-picker.medium::before,
.pencil-palette label.medium::before {
  margin: 0.5rem auto;
  width: 0.7rem;
  height: 0.7rem;
}

.pencil-picker.small::before,
.pencil-palette label.small::before {
  margin: 0.55rem auto;
  width: 0.5rem;
  height: 0.5rem;
}

.pencil-picker.tiny::before,
.pencil-palette label.tiny::before {
  margin: 0.6rem auto;
  width: 0.3rem;
  height: 0.3rem;
}

.pencil-palette {
  background-color: $dark-grey-light;
  border-radius: 5px;
  bottom: calc(100% + 0.1rem);
  left: 50%;
  padding: 0.5rem;
  position: absolute;
  transform: translateX(-50%);
  z-index: 900;
}
.preview .pencil-palette {
  background-color: $dark-grey;
}
.pencil-palette label {
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 0.25rem 0;
  padding: 0.15rem 0.4rem;
  transition: background-color 0.15s ease;
}
.pencil-palette label:hover {
  background-color: rgba(255, 255, 255, 0.12);
}
.pencil-palette input {
  display: none;
}
</style>
