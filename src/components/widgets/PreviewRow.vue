<template>
  <div
    :class="{
      'preview-row': true,
      'has-text-center': true,
      selected: selected,
      green: preview.validation_status === 'validated'
    }"
  >
    <button-link :text="label" :path="previewPath" />
  </div>
</template>

<script>
import ButtonLink from '@/components/widgets/ButtonLink.vue'

export default {
  name: 'preview-row',
  components: {
    ButtonLink
  },
  props: {
    preview: {
      type: Object,
      default: () => {}
    },
    selected: {
      type: Boolean,
      default: false
    },
    previewPath: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    label() {
      const label = `v${this.preview.revision}`
      return label
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.preview-row {
  margin-right: 0.5em;
}

.preview-row a {
  border: 3px solid $light-grey;
}

.preview-row:hover a {
  border: 3px solid #e1d4f9;
}

.preview-row.green a {
  border: 3px solid $light-green;
}

.preview-row.red a {
  border: 3px solid $dark-red;
}

.preview-row.selected a {
  border: 3px solid #8f91eb;
}
</style>
