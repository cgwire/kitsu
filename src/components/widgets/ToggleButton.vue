<template>
  <div class="toggle-container">
    <button
      type="button"
      role="switch"
      class="toggle-button"
      :class="{ 'is-active': modelValue }"
      @click="$emit('update:modelValue', !modelValue)"
      :aria-checked="modelValue"
    >
      <span class="toggle-slider"></span>
    </button>
    <span v-if="label" class="toggle-label">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  label: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.toggle-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-size: 14px;
  user-select: none;
}

.toggle-button {
  position: relative;
  width: 32px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background-color: #e4e4e4;
  cursor: pointer;
  transition: background-color 0.3s ease;
  outline: none;

  .dark & {
    background-color: #666;
  }
}

.toggle-button.is-active {
  background-color: #4caf50;
}

.toggle-slider {
  position: absolute;
  top: 2.5px;
  left: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: white;
  transition: transform 0.3s ease;
}

.toggle-button.is-active .toggle-slider {
  transform: translateX(15px);
}

.toggle-button:hover {
  opacity: 0.9;
}

.toggle-button:focus {
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}
</style>
