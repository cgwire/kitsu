<template>
  <combobox
    :label="label"
    :disabled="disabled"
    :options="modelOptions"
    :model-value="currentModelId"
    @update:model-value="emitValue"
    @enter="emitEnter"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

import Combobox from '@/components/widgets/Combobox.vue'

const props = defineProps({
  label: {
    default: '',
    type: String
  },

  modelValue: {
    default: () => {},
    type: Object
  },

  models: {
    default: () => [],
    type: Array
  },

  disabled: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['enter', 'update:modelValue'])

const currentModelId = ref('')
const modelMap = ref({})
const modelOptions = ref([])

function emitValue(value) {
  currentModelId.value = value
  const model = modelMap.value[currentModelId.value]
  emit('update:modelValue', model)
}

function emitEnter(value) {
  currentModelId.value = value
  const model = modelMap.value[currentModelId.value]
  emit('enter', model)
}

function reset() {
  if (props.models.length > 0) {
    currentModelId.value =
      props.models.find(model => model.id === props.modelValue.id) ??
      props.models[0].id
    modelMap.value = {}
    modelOptions.value = props.models.map(model => ({
      label: model.name,
      value: model.id
    }))
    props.models.forEach(model => {
      modelMap.value[model.id] = model
    })
  }
}

onMounted(() => {
  reset()
})

watch(
  () => props.models,
  () => {
    reset()
  }
)
</script>
