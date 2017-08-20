<template>
<td class="actions">
  <p class="field">
    <router-link class="button" :to="editRoute" v-if="!hideEdit">
      <span class="icon is-small">
        <i class="fa fa-edit"></i>
      </span>
    </router-link>
    <router-link class="button" :to="deleteRoute">
      <span class="icon is-small">
        <i class="fa fa-trash"></i>
      </span>
    </router-link>
  </p>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'row-actions',
  props: [
    'editRoute',
    'deleteRoute',
    'entryId',
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
.actions {
  text-align: right;
}
</style>
