<template>
<td class="actions">
  <p class="field">
    <a class="button" @click="onEditClicked(entryId)">
      <span class="icon is-small">
        <i class="fa fa-edit"></i>
      </span>
    </a>
    <router-link class="button" :to="'/people/delete/' + entryId">
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
    'onEditClicked',
    'onDeleteClicked',
    'entryId'
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
