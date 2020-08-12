<template>
<div class="level page-header">
  <div class="level-left">
    <page-title :text="title" />
  </div>
  <div class="level-right">
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
import { mapGetters, mapActions } from 'vuex'

import ButtonSimple from '../widgets/ButtonSimple'
import PageTitle from '../widgets/PageTitle'

export default {
  name: 'list-page-header',

  components: {
    ButtonSimple,
    PageTitle
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    newEntryLabel: {
      type: String,
      default: ''
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ])
  },

  watch: {}
}
</script>

<style lang="scss" scoped>
</style>
