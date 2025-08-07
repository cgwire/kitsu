<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable multi-section">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('productions.fields.name') }}
            </th>
            <th scope="col" class="code">
              {{ $t('productions.fields.code') }}
            </th>
            <th scope="col" class="type">
              {{ $t('productions.fields.type') }}
            </th>
            <th scope="col" class="style">
              {{ $t('productions.fields.style') }}
            </th>
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
          <template :key="entry.id" v-for="entry in openProductions">
            <tr class="datatable-row">
              <th class="name datatable-row-header" scope="row">
                <production-name-cell
                  :with-avatar="true"
                  :entry="entry"
                  :last-production-screen="lastProductionScreen"
                />
              </th>
              <td class="code">
                {{ entry.code }}
              </td>
              <td class="type">
                {{ $t(`productions.type.${entry.production_type || 'short'}`) }}
              </td>
              <td class="style">
                {{
                  $t(
                    `productions.style.${
                      getProductionStyleLabel(entry.production_style) || '2d3d'
                    }`
                  )
                }}
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
              <row-actions-cell
                @edit-clicked="$emit('edit-clicked', entry)"
                :hide-delete="true"
              />
            </tr>
            <tr
              class="datatable-row"
              v-if="Object.keys(productionStats).length > 0"
            >
              <td :colspan="7" class="datatable-row-stats">
                <production-stats :stats="productionStatsMap[entry.id] || {}" />
              </td>
            </tr>
          </template>
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
            :key="entry.id"
            v-for="entry in closedProductions"
          >
            <th class="name datatable-row-header" scope="row">
              <production-name-cell
                :with-avatar="true"
                :entry="entry"
                :last-production-screen="lastProductionScreen"
                :is-link="false"
              />
            </th>
            <td class="code">
              {{ entry.code }}
            </td>
            <td class="type">
              {{ $t(`productions.type.${entry.production_type || 'short'}`) }}
            </td>
            <td class="style">
              {{
                $t(
                  `productions.style.${
                    getProductionStyleLabel(entry.production_style) || '2d3d'
                  }`
                )
              }}
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
            <row-actions-cell
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError"> </table-info>

    <p class="has-text-centered nb-productions">
      {{ entries.length }} {{ $tc('productions.number', entries.length) }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { PRODUCTION_STYLE_OPTIONS } from '@/lib/productions'

import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import ProductionStats from '@/components/pages/production/ProductionStats.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'production-list',

  props: {
    entries: {
      type: Array,
      default: () => []
    },
    productionStats: {
      type: Object,
      default: () => {}
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  components: {
    ProductionNameCell,
    ProductionStats,
    RowActionsCell,
    TableInfo
  },

  emits: ['delete-clicked', 'edit-clicked'],

  computed: {
    ...mapGetters(['openProductions', 'lastProductionScreen']),

    closedProductions() {
      return this.entries.filter(p => p.project_status_name === 'Closed')
    },

    productionStatsMap() {
      return this.productionStats
    }
  },

  methods: {
    // Convert a database status to a locale key.
    getStatusLocale(originalStatus) {
      const statusMap = {
        Active: 'productions.status.open', // Shotgun compatibility
        Open: 'productions.status.open',
        Closed: 'productions.status.closed'
      }
      return statusMap[originalStatus]
    },

    getProductionStyleLabel(value) {
      return PRODUCTION_STYLE_OPTIONS.find(style => style.value === value)
        ?.label
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

.style {
  min-width: 150px;
  width: 150px;
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
  width: 110px;
  min-width: 110px;
  padding: 10px;
  text-align: right;
}
</style>
