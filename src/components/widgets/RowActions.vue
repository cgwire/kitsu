<template>
<td class="actions has-text-right">
  <button-link
    icon="edit"
    :path="editRoute"
    v-if="!hideEdit"
  >
  </button-link>
  <button-link
    icon="delete"
    :path="deleteRoute"
  >
  </button-link>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonLink from './ButtonLink'

export default {
  name: 'row-actions',
  components: {
    ButtonLink
  },
  props: [
    'editRoute',
    'deleteRoute',
    'hideEdit'
  ],
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style scoped>
</style>
