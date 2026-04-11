<template>
  <div class="flexrow flexrow-item" v-if="!isConcept">
    <button-simple
      :class="{ ml1: isMovie || isSound }"
      :active="isComparing"
      icon="compare"
      :title="$t('playlists.actions.split_screen')"
      @click="$emit('compare-clicked')"
      v-if="taskTypeOptions.length > 0 && isComparisonEnabled"
    />

    <combobox
      class="comparison-combobox dark"
      :options="taskTypeOptions"
      :is-dark="true"
      :thin="true"
      v-model="taskTypeId"
      v-if="isComparing && (!light || isComparisonEnabled)"
    />
    <combobox
      class="comparison-combobox dark"
      :options="previewFileOptions"
      :is-dark="true"
      :thin="true"
      v-model="previewToCompareId"
      v-if="isComparing && (!light || isComparisonEnabled)"
    />
    <combobox
      class="comparison-combobox"
      :options="comparisonModeOptions"
      :is-dark="true"
      :thin="true"
      v-model="comparisonMode"
      v-if="isComparing && (!light || isComparisonEnabled)"
    />
    <div
      class="flexrow flexrow-item comparison-list"
      v-if="
        isComparing &&
        (!light || isComparisonEnabled) &&
        comparisonPreviewLength > 0
      "
    >
      <button-simple
        class="button playlist-button flexrow-item"
        icon="left"
        @click="$emit('previous-comparison-clicked')"
      />
      <span class="flexrow-item comparison-index">
        {{ comparisonPreviewIndex + 1 }} /
        {{ comparisonPreviewLength }}
      </span>
      <button-simple
        class="button playlist-button flexrow-item"
        icon="right"
        @click="$emit('next-comparison-clicked')"
      />
    </div>
  </div>
</template>

<script setup>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'

defineProps({
  comparisonModeOptions: {
    type: Array,
    default: () => []
  },
  comparisonPreviewIndex: {
    type: Number,
    default: 0
  },
  comparisonPreviewLength: {
    type: Number,
    default: 0
  },
  isComparing: {
    type: Boolean,
    default: false
  },
  isComparisonEnabled: {
    type: Boolean,
    default: false
  },
  isConcept: {
    type: Boolean,
    default: false
  },
  isMovie: {
    type: Boolean,
    default: false
  },
  isSound: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  previewFileOptions: {
    type: Array,
    default: () => []
  },
  taskTypeOptions: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'compare-clicked',
  'next-comparison-clicked',
  'previous-comparison-clicked'
])

const comparisonMode = defineModel('comparisonMode')
const previewToCompareId = defineModel('previewToCompareId')
const taskTypeId = defineModel('taskTypeId')
</script>

<style lang="scss" scoped>
.comparison-combobox {
  margin-bottom: 0;
}
</style>
