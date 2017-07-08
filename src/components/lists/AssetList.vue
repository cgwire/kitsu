<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="name">{{ $t('assets.fields.name') }}</th>
        <th class="type">{{ $t('assets.fields.type') }}</th>
        <th class="actions"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <td class="name">
          {{ entry.name }}
        </td>
        <td class="type">
          {{ entry.task_type_name }}
        </td>
        <row-actions
          :entry-id="entry.id"
          :edit-route="'/assets/edit/' + entry.id"
          :delete-route="'/assets/delete/' + entry.id"
        >
        </row-actions>
      </tr>
    </tbody>
  </table>

  <div class="has-text-centered" v-if="isLoading">
    <img src="../../assets/spinner.svg">
  </div>
  <div class="has-text-centered" v-if="isError">
    <span class="tag is-danger">An error occured while loading data</span>
  </div>

  <p class="has-text-centered nb-assets">
    {{ entries.length }} {{ $tc('assets.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'

export default {
  name: 'asset-list',
  props: [
    'entries',
    'isLoading',
    'isError'
  ],
  data () {
    return {}
  },
  components: {
    RowActions
  },
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
.name {
  width: 300px;
}

.type {
  width: 100px;
}
</style>
