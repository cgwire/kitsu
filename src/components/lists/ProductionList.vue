<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="project">&nbsp;</th>
          <th class="name">{{ $t('productions.fields.name') }}</th>
          <th class="status">{{ $t('productions.fields.status') }}</th>
          <th class="actions"></th>
        </tr>
      </thead>
    </table>
  </div>

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table">
      <tbody>
        <tr v-for="entry in entries">
          <production-name-cell
            class="project"
            :only-avatar="true"
            :entry="entry"
          >
          </production-name-cell>
          <td class="name">
            {{ entry.name }}
          </td>
          <td class="td-status">
            {{ $t(getStatusLocale(entry.project_status_name)) }}
          </td>
          <row-actions
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-production',
              params: {production_id: entry.id}
            }"
            :delete-route="{
              name: 'delete-production',
              params: {production_id: entry.id}
            }"
          >
          </row-actions>
        </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <p class="has-text-centered nb-productions">
    {{ entries.length }} {{ $tc('productions.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionNameCell from '../cells/ProductionNameCell'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'production-list',
  props: [
    'entries',
    'isLoading',
    'isError'
  ],
  data () {
    return {}
  },
  components: {
    ProductionNameCell,
    RowActions,
    TableInfo
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    // Convert a database status to a locale key.
    getStatusLocale (originalStatus) {
      const statusMap = {
        Active: 'productions.status.open', // Shotgun compatibility
        Open: 'productions.status.open',
        Closed: 'productions.status.closed'
      }
      return statusMap[originalStatus]
    },
    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style scoped>
.project {
  min-width: 60px;
  width: 60px;
}

.name {
  min-width: 250px;
  width: 250px;
}

.status {
  min-width: 100px;
  width: 100px;
}

.actions {
  min-width: 100px;
}
</style>
