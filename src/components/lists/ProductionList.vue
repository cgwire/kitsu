<template>
  <div class="data-list">
    <table-metadata-header-menu
      ref="headerMetadataMenu"
      :is-edit-allowed="isProjectMetadataMenuEditAllowed"
      :is-sticked="false"
      :show-sort="false"
      :show-stick="false"
      @delete-clicked="onDeleteMetadataClicked"
      @edit-clicked="onEditMetadataClicked"
      @sort-by-clicked="onSortByMetadataClicked"
      @toggle-stick="onToggleProjectMetadataStick"
    />
    <div class="datatable-wrapper">
      <table class="datatable multi-section">
        <thead
          class="datatable-head"
          id="datatable-productions"
          v-columns-resizable
        >
          <tr>
            <th class="name datatable-row-header" scope="col">
              <div class="flexrow">
                <span class="flexrow-item">
                  {{ $t('productions.fields.name') }}
                </span>
                <button-simple
                  class="is-small flexrow-item"
                  :text="''"
                  @click="onAddMetadataClick"
                  icon="plus"
                  v-if="
                    (isCurrentUserManager || isCurrentUserSupervisor) &&
                    !isLoading
                  "
                />
              </div>
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
            <metadata-header
              :key="'pmeta-h-' + d.field_name"
              :descriptor="d"
              @show-metadata-header-menu="
                event => showMetadataHeaderMenu(d.field_name, event)
              "
              v-for="d in visibleProjectMetadataDescriptors"
            />
            <th class="actions" ref="actionsSection" scope="col">
              <table-metadata-selector-menu
                :descriptors="mergedProjectMetadataDescriptors"
                :exclude="{}"
                :external-reorder="onAllProjectsMetadataReorder"
                :model-value="metadataDisplayHeaders"
                namespace="all-productions"
                v-model:is-open="columnSelectorDisplayed"
                @update:model-value="
                  $emit('update:metadataDisplayHeaders', $event)
                "
              />
              <button-simple
                class="is-small is-pulled-right mr05"
                icon="down"
                @click="toggleColumnSelector"
              />
            </th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr class="datatable-type-header">
            <th
              scope="rowgroup"
              :colspan="8 + visibleProjectMetadataDescriptors.length"
            >
              <span class="datatable-row-header">
                {{ $t('productions.status.open') }}
                ({{ openProductions.length }})
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
              <td
                class="metadata-descriptor"
                :key="entry.id + '-pm-' + d.field_name"
                v-for="d in visibleProjectMetadataDescriptors"
              >
                <template
                  v-if="getProjectDescriptorForField(entry, d.field_name)"
                >
                  <metadata-input
                    :entity="entry"
                    :descriptor="
                      getProjectDescriptorForField(entry, d.field_name)
                    "
                    :indexes="{ i: 0, j: 0, k: 0 }"
                    @metadata-changed="onProjectMetadataInCell"
                  />
                </template>
                <span class="empty-metadata" v-else>—</span>
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
              <td
                :colspan="7 + visibleProjectMetadataDescriptors.length"
                class="datatable-row-stats"
              >
                <production-stats :stats="productionStats[entry.id] || {}" />
              </td>
              <td class="actions"></td>
            </tr>
          </template>
        </tbody>
        <tbody v-if="closedProductions.length > 0">
          <tr class="datatable-type-header">
            <th
              scope="rowgroup"
              :colspan="8 + visibleProjectMetadataDescriptors.length"
            >
              <span class="datatable-row-header">
                {{ $t('productions.status.closed') }}
                ({{ closedProductions.length }})
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
            <td
              class="metadata-descriptor"
              :key="entry.id + '-pm-closed-' + d.field_name"
              v-for="d in visibleProjectMetadataDescriptors"
            >
              <template
                v-if="getProjectDescriptorForField(entry, d.field_name)"
              >
                <metadata-input
                  :entity="entry"
                  :descriptor="
                    getProjectDescriptorForField(entry, d.field_name)
                  "
                  :indexes="{ i: 0, j: 0, k: 0 }"
                  @metadata-changed="onProjectMetadataInCell"
                />
              </template>
              <span class="empty-metadata" v-else>—</span>
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
import { mapActions, mapGetters } from 'vuex'

import { PRODUCTION_STYLE_OPTIONS } from '@/lib/productions'
import { descriptorMixin } from '@/components/mixins/descriptors'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import ProductionStats from '@/components/pages/production/ProductionStats.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

export default {
  name: 'production-list',

  mixins: [descriptorMixin],

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
    },
    metadataDisplayHeaders: {
      type: Object,
      default: () => ({})
    }
  },

  components: {
    ButtonSimple,
    MetadataHeader,
    MetadataInput,
    ProductionNameCell,
    ProductionStats,
    RowActionsCell,
    TableInfo,
    TableMetadataHeaderMenu,
    TableMetadataSelectorMenu
  },

  emits: [
    'add-metadata',
    'delete-clicked',
    'edit-clicked',
    'metadata-changed',
    'update:metadataDisplayHeaders'
  ],

  data() {
    return {
      columnSelectorDisplayed: false,
      lastMetadaDataHeaderMenuDisplayed: null
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'mergedProjectMetadataDescriptors',
      'openProductions',
      'lastProductionScreen'
    ]),

    isProjectMetadataMenuEditAllowed() {
      const fieldName = this.lastMetadaDataHeaderMenuDisplayed
      if (!fieldName) {
        return false
      }
      const d = this.visibleProjectMetadataDescriptors.find(
        x => x.field_name === fieldName
      )
      if (!d) {
        return false
      }
      return this.isCurrentUserManager || this.isCurrentUserSupervisor
    },

    closedProductions() {
      return this.entries.filter(p => p.project_status_name === 'Closed')
    },

    visibleProjectMetadataDescriptors() {
      return this.mergedProjectMetadataDescriptors.filter(d => {
        const header = this.metadataDisplayHeaders[d.field_name]
        return header === undefined || header
      })
    },

    /**
     * Cache project descriptors per (entryId, fieldName) so the template
     * doesn't re-scan `production.descriptors` twice per cell on every render.
     */
    projectDescriptorMap() {
      const map = new Map()
      this.entries.forEach(entry => {
        const inner = new Map()
        ;(entry.descriptors || []).forEach(descriptor => {
          if (descriptor.entity_type === 'Project') {
            inner.set(descriptor.field_name, descriptor)
          }
        })
        map.set(entry.id, inner)
      })
      return map
    }
  },

  methods: {
    ...mapActions(['reorderAllProjectsProjectMetadata']),

    onAddMetadataClick() {
      this.$emit('add-metadata')
    },

    onAllProjectsMetadataReorder(ordered) {
      return this.reorderAllProjectsProjectMetadata({
        entityType: 'Project',
        fieldOrder: (ordered || []).map(d => d.field_name)
      })
    },

    onSortByMetadataClicked() {},

    toggleColumnSelector() {
      this.columnSelectorDisplayed = !this.columnSelectorDisplayed
    },

    onToggleProjectMetadataStick() {},

    getProductionStyleLabel(value) {
      return PRODUCTION_STYLE_OPTIONS.find(style => style.value === value)
        ?.label
    },

    getProjectDescriptorForField(production, fieldName) {
      return (
        this.projectDescriptorMap.get(production.id)?.get(fieldName) || null
      )
    },

    onProjectMetadataInCell({ entry, descriptor, value }) {
      this.$emit('metadata-changed', { entry, descriptor, value })
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  min-width: 250px;
  width: 250px;
}

.code {
  max-width: 130px;
  min-width: 88px;
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type {
  min-width: 120px;
  width: 120px;
}

.style {
  min-width: 150px;
  width: 150px;
}

.actions {
  min-width: 120px;
  padding: 0.4em;
  position: relative;
}

.fps,
.ratio,
.resolution {
  width: 110px;
  min-width: 110px;
  padding: 10px;
  text-align: right;
}

.empty-metadata {
  color: var(--text-alt);
}
</style>
