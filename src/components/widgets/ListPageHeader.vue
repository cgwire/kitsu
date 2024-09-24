<template>
  <div class="level page-header">
    <div class="level-left">
      <page-title :text="title" />
    </div>
    <div class="level-right">
      <button-simple
        class="flexrow-item"
        icon="export"
        :title="$t('main.csv.export_file')"
        @click="$emit('export-clicked')"
        v-if="isExportable"
      />
      <button-simple
        class="level-item"
        icon="plus"
        :text="newEntryLabel"
        @click="$emit('new-clicked')"
      />
    </div>
  </div>
</template>

<script>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

export default {
  name: 'list-page-header',

  components: {
    ButtonSimple,
    PageTitle
  },

  props: {
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
  },

  emits: ['export-clicked', 'new-clicked']
}
</script>
