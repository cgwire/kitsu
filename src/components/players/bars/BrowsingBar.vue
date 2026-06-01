<template>
  <div class="left flexrow">
    <button-simple
      class="flexrow-item"
      icon="left"
      :title="$t('playlists.actions.files_previous')"
      @click="$emit('previous-clicked')"
      v-if="isBigDisplay || !isMovie"
    />

    <span
      class="flexrow-item bar-element current-index"
      :title="$t('playlists.actions.files_position')"
      @click="$emit('current-index-clicked')"
      v-if="isBigDisplay || !isMovie"
    >
      {{ currentIndex }}
      <template v-if="fullScreen || !isMovie">/ {{ previews.length }}</template>
    </span>

    <button-simple
      class="flexrow-item"
      icon="right"
      :title="$t('playlists.actions.files_next')"
      @click="$emit('next-clicked')"
      v-if="isBigDisplay || !isMovie"
    />

    <button-simple
      class="flexrow-item"
      icon="plus"
      :title="$t('playlists.actions.files_add')"
      @click="$emit('add-preview-clicked')"
      v-if="(isAssigned || !readOnly) && !fullScreen && allowExtraPreview"
    />

    <button-simple
      class="flexrow-item"
      icon="trash"
      :title="$t('playlists.actions.files_delete')"
      @click="$emit('remove-preview-clicked')"
      v-if="!readOnly && !fullScreen && !light"
    />

    <div class="separator" v-if="isBigDisplay"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const props = defineProps({
  allowExtraPreview: {
    type: Boolean,
    default: true
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  isAssigned: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  previews: {
    type: Array,
    default: () => []
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'add-preview-clicked',
  'current-index-clicked',
  'next-clicked',
  'previous-clicked',
  'remove-preview-clicked'
])

const isBigDisplay = computed(
  () => (!props.light || props.fullScreen) && props.previews.length > 1
)

const isMovie = computed(
  () => props.previews[props.currentIndex - 1]?.extension === 'mp4'
)
</script>

<style lang="scss" scoped>
.bar-element {
  color: $light-grey;
  padding-left: 1em;
}

.current-index {
  cursor: pointer;
  white-space: nowrap;
}
</style>
