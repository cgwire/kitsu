<template>
<div class="data-list">
  <div class="datatable-wrapper">
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="name datatable-row-header">
            {{ $t('productions.fields.name') }}
          </th>
          <th scope="col" class="type">{{ $t('productions.fields.type') }}</th>
          <th scope="col" class="fps">{{ $t('productions.fields.fps') }}</th>
          <th scope="col" class="ratio">
            {{ $t('productions.fields.ratio') }}
          </th>
          <th scope="col" class="resolution">
            {{ $t('productions.fields.resolution') }}
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody class="datatable-body">
        <tr class="datatable-type-header">
          <th scope="rowgroup" colspan="6">
            <span class="datatable-row-header">
              {{ $t('productions.status.open') }}
            </span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          v-for="entry in openProductions"
          :key="entry.id"
        >
          <th class="name datatable-row-header" scope="row">
            <production-name-cell
              :with-avatar="true"
              :entry="entry"
              :last-production-screen="lastProductionScreen"
            />
          </th>
          <td class="type">
            {{ $t('productions.type.' + (entry.production_type || 'short')) }}
          </td>
          <td class="fps">
            {{ entry.fps }}
          </td>
          <td class="ratio">
            {{ entry.ratio }}
          </td>
          <td class="resolution">
            {{ entry.resolution }}
          </td>
          <row-actions
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-production',
              params: {production_edit_id: entry.id}
            }"
            :hide-delete="true"
          />
        </tr>
      </tbody>
      <tbody v-if="closedProductions.length > 0">
        <tr class="datatable-type-header">
          <th scope="rowgroup" colspan="6">
            <span class="datatable-row-header">
              {{ $t('productions.status.closed') }}
            </span>
          </th>
        </tr>
        <tr
          class="datatable-row"
          v-for="entry in closedProductions"
          :key="entry.id"
        >
          <th class="name datatable-row-header" scope="row">
            <production-name-cell
              :with-avatar="true"
              :entry="entry"
              :last-production-screen="lastProductionScreen"
            />
          </th>
          <td class="type">
            {{ $t('productions.type.' + (entry.production_type || 'short')) }}
          </td>
          <td class="fps">
            {{ entry.fps }}
          </td>
          <td class="ratio">
            {{ entry.ratio }}
          </td>
          <td class="resolution">
            {{ entry.resolution }}
          </td>
          <row-actions
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-production',
              params: {production_edit_id: entry.id}
            }"
            :delete-route="{
              name: 'delete-production',
              params: {production_delete_id: entry.id}
            }"
          />
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
      'openProductions',
      'lastProductionScreen'
    ]),

    closedProductions () {
      return this.entries.filter(p => p.project_status_name === 'Closed')
    }
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
    }
  }
}
</script>

<style lang="scss" scoped>

.name {
  min-width: 250px;
  width: 250px;
}

.type {
  min-width: 120px;
  width: 120px;
}

.status {
  min-width: 100px;
  width: 100px;
}

.actions {
  min-width: 100px;
}

.fps,
.ratio,
.resolution {
  width: 100px;
  min-width: 100px;
}

</style>
