<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">{{ $t('asset_types.fields.name') }}</th>
          <th class="actions"></th>
        </tr>
      </thead>
    </table>
  </div>

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table">
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
  </div>

  <spinner v-if="isLoading"></spinner>
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
import Spinner from '../widgets/Spinner'

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
    RowActions,
    Spinner
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style scoped>
.name {
  width: 300px;
  padding: 1em;
}
</style>
