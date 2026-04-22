<template>
  <div class="flexrow page-header">
    <page-title class="flexrow-item filler" :text="title" />
    <button-simple
      class="flexrow-item export-button"
      icon="export"
      :title="$t('main.csv.export_file')"
      @click="$emit('export-clicked')"
      v-if="isExportable"
    />
    <button-simple
      class="flexrow-item mr0"
      icon="plus"
      :text="newEntryLabel"
      :is-responsive="true"
      @click="$emit('new-clicked')"
    />
  </div>
</template>

<script setup>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

defineProps({
  isExportable: {
    type: Boolean,
    default: true
  },
  newEntryLabel: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['export-clicked', 'new-clicked'])
</script>

<style lang="scss" scoped>
@media screen and (max-width: 768px) {
  .export-button {
    display: none;
  }
}
</style>
