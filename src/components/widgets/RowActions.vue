<template>
<td class="actions">
  <p class="field">
    <a class="button" @click="onEditClicked">
      <span class="icon is-small">
        <i class="fa fa-edit"></i>
      </span>
    </a>
    <a class="button" @click="onDeleteClicked">
      <span class="icon is-small">
        <i class="fa fa-trash"></i>
      </span>
    </a>
  </p>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'row-actions',
  props: [
    'onEditClicked',
    'onDeleteClicked'
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
