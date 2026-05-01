<template>
  <td>
    <div class="flexrow">
      <span class="value flexrow-item">
        {{ value }}
      </span>
      <vue-slider
        class="flexrow-item slider"
        :dot-options="{ focusStyle: { 'box-shadow': '0 0 1px 1px #8F91EBA0' } }"
        :interval="0.25"
        :lazy="true"
        :min="0"
        :max="12"
        :marks="marks"
        :piecewise="true"
        :process-style="{ 'background-color': '#8F91EB' }"
        :tooltip="'hover'"
        :use-keyboard="true"
        :step-style="stepStyle"
        :width="400"
        v-model="value"
      />
      <button class="button flexrow-item" @click="setValue(1)">1</button>
      <button class="button flexrow-item" @click="setValue(4)">4</button>
      <button class="button flexrow-item" @click="setValue(hoursByDay)">
        {{ hoursByDay }}
      </button>
    </div>
  </td>
</template>

<script setup>
import VueSlider from 'vue-3-slider-component'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  duration: { type: Number, default: 0 },
  taskId: { type: String, default: '' }
})

const emit = defineEmits(['change'])

const labelStyle = { fontSize: '.6em', top: '3px', left: '1px' }
const marks = {
  0: { label: '0', labelStyle },
  2: { label: '' },
  4: { label: '4', labelStyle },
  6: { label: '' },
  8: { label: '8', labelStyle },
  10: { label: '' },
  12: { label: '12', labelStyle }
}
const stepStyle = {
  display: 'block',
  borderRadius: 0,
  height: '10px',
  width: '4px',
  top: '-1px',
  backgroundColor: 'gray'
}

const value = ref(props.duration)

const organisation = computed(() => store.getters.organisation)
const hoursByDay = computed(() => organisation.value.hours_by_day || 8)

const setValue = v => {
  value.value = v || 0
}

watch(value, v => {
  emit('change', { taskId: props.taskId, duration: v })
})
</script>

<style lang="scss" scoped>
.value {
  font-size: 1.5em;
  font-weight: bold;
  width: 40px;
}

.slider {
  cursor: pointer;
}
</style>
