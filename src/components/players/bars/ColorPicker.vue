<template>
  <div class="color-wrapper">
    <button
      type="button"
      :class="{
        'color-picker': true
      }"
      :title="color"
      :style="{ color: color }"
      @click="togglePalette"
    />
    <div
      v-show="isOpen"
      :class="{
        'color-palette': true
      }"
    >
      <label
        :key="shade"
        :title="shade"
        :style="{ color: shade }"
        v-for="shade in palette"
      >
        <input type="radio" :value="shade" @click="onColorPicked(shade)" />
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: ''
  },
  modelValue: {
    // When the parent passes a Boolean here, the picker is
    // controlled — open/close decisions go through update:model-value
    // so siblings can be coordinated (one panel open at a time).
    // Leaving it undefined falls back to internal state.
    type: Boolean,
    default: undefined
  },
  palette: {
    // Laid out as a 4×3 grid by .color-palette below.
    // Row 1 — neutrals: black / grey / white / brown
    // Row 2 — warm:      red / pink / orange / yellow
    // Row 3 — cool:      green / cyan / blue / purple
    default: () => [
      '#000000',
      '#757575',
      '#FFFFFF',
      '#795548',
      '#FF3860',
      '#E91E63',
      '#F57F17',
      '#FFCA28',
      '#008732',
      '#00ACC1',
      '#039BE5',
      '#5E60BA'
    ],
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

const onColorPicked = shade => {
  emit('change', shade)
  setOpen(false)
}
</script>

<style lang="scss" scoped>
.color-wrapper {
  position: relative;
  display: inline-flex;
}
.color-picker {
  padding: 0;
  background-color: transparent;
  cursor: pointer;
}
.preview .color-picker {
  background-color: $dark-grey;
}
.color-picker::before,
.color-palette label::before {
  display: block;
  content: '';
  margin: 0.25rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: currentColor;
}
.color-palette {
  background-color: $dark-grey-light;
  border-radius: 5px;
  // Sit just above the picker button with a small gap so the
  // dropdown doesn't overlap the bar. Centered horizontally on the
  // button via left: 50% + translateX(-50%).
  bottom: calc(100% + 0.1rem);
  display: grid;
  gap: 0.15rem;
  grid-template-columns: repeat(4, auto);
  left: 50%;
  padding: 0.5rem;
  position: absolute;
  transform: translateX(-50%);
  z-index: 900;
}
.preview .color-palette {
  background-color: $dark-grey;
}
.color-palette label {
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 0;
  padding: 0.25rem;
  transition: background-color 0.15s ease;
}
.color-palette label:hover {
  background-color: rgba(255, 255, 255, 0.12);
}
.color-palette label::before {
  margin: 0;
}
.color-palette input {
  display: none;
}
</style>
