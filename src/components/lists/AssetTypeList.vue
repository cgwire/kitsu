<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="name">{{ $t('asset_types.fields.name') }}</th>
        <th class="actions"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <td class="name">
           {{ entry.name }}
        </td>
        <row-actions
          :entry-id="entry.id"
          :edit-route="{
            name: 'edit-asset-type',
            params: {asset_type_id: entry.id}
          }"
          :delete-route="{
            name: 'delete-asset-type',
            params: {asset_type_id: entry.id}
          }"
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

  <p class="has-text-centered nb-asset-types">
    {{ entries.length }} {{ $tc('asset_types.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'

export default {
  name: 'asset-type-list',
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
  padding: 1em;
}
</style>
