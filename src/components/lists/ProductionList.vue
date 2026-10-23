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
    />
    <div class="datatable-wrapper">
      <table class="datatable datatable--cards multi-section">
        <thead
          class="datatable-head"
          id="datatable-productions"
          v-columns-resizable
        >
          <tr>
            <th
              class="name datatable-row-header"
              data-column-key="name"
              scope="col"
            >
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
                  $emit('update:metadata-display-headers', $event)
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
          <template :key="section.label" v-for="section in openSections">
            <tr class="datatable-type-header">
              <th
                scope="rowgroup"
                :colspan="8 + visibleProjectMetadataDescriptors.length"
              >
                <span class="datatable-row-header">
                  {{ section.label }}
                  ({{ section.productions.length }})
                </span>
              </th>
            </tr>
            <template :key="entry.id" v-for="entry in section.productions">
              <tr class="datatable-row">
                <th class="name datatable-row-header" scope="row">
                  <production-name-cell
                    :with-avatar="true"
                    :entry="entry"
                    :last-production-screen="lastProductionScreen"
                  />
                </th>
                <td class="code" :data-label="$t('productions.fields.code')">
                  {{ entry.code }}
                </td>
                <td class="type" :data-label="$t('productions.fields.type')">
                  {{
                    $t(`productions.type.${entry.production_type || 'short'}`)
                  }}
                </td>
                <td class="style" :data-label="$t('productions.fields.style')">
                  {{
                    $t(
                      `productions.style.${
                        getProductionStyleLabel(entry.production_style) ||
                        '2d3d'
                      }`
                    )
                  }}
                </td>
                <td class="fps" :data-label="$t('productions.fields.fps')">
                  {{ entry.fps }}
                </td>
                <td class="ratio" :data-label="$t('productions.fields.ratio')">
                  {{ entry.ratio }}
                </td>
                <td
                  class="resolution"
                  :data-label="$t('productions.fields.resolution')"
                >
                  {{ entry.resolution }}
                </td>
                <td
                  class="metadata-descriptor"
                  :key="entry.id + '-pm-' + d.field_name"
                  v-for="d in visibleProjectMetadataDescriptors"
                >
                  <!-- Fall back to the merged column descriptor when the
                       production has no own copy yet: first edit creates it. -->
                  <metadata-input
                    :entity="entry"
                    :descriptor="
                      getProjectDescriptorForField(entry, d.field_name) || d
                    "
                    :indexes="{ i: 0, j: 0, k: 0 }"
                    @metadata-changed="onProjectMetadataInCell"
                  />
                </td>
                <row-actions-cell
                  @edit-clicked="$emit('edit-clicked', entry)"
                  :hide-delete="true"
                />
              </tr>
              <tr
                class="datatable-row stats-row"
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
          </template>
        </tbody>
        <tbody class="datatable-body" v-if="closedProductions.length > 0">
          <tr class="datatable-type-header">
            <th
              scope="rowgroup"
              :colspan="8 + visibleProjectMetadataDescriptors.length"
            >
              <span
                class="datatable-row-header section-toggle"
                role="button"
                tabindex="0"
                @click="toggleClosedSection"
                @keydown.enter.prevent="toggleClosedSection"
                @keydown.space.prevent="toggleClosedSection"
              >
                <chevron-down-icon
                  class="section-chevron"
                  :size="14"
                  v-if="isClosedSectionDisplayed"
                />
                <chevron-right-icon class="section-chevron" :size="14" v-else />
                {{ $t('productions.status.closed') }}
                ({{ closedProductions.length }})
              </span>
            </th>
          </tr>
          <tr
            class="datatable-row"
            :key="entry.id"
            v-for="entry in displayedClosedProductions"
          >
            <th class="name datatable-row-header" scope="row">
              <production-name-cell
                :with-avatar="true"
                :entry="entry"
                :last-production-screen="lastProductionScreen"
                :is-link="false"
              />
            </th>
            <td class="code" :data-label="$t('productions.fields.code')">
              {{ entry.code }}
            </td>
            <td class="type" :data-label="$t('productions.fields.type')">
              {{ $t(`productions.type.${entry.production_type || 'short'}`) }}
            </td>
            <td class="style" :data-label="$t('productions.fields.style')">
              {{
                $t(
                  `productions.style.${
                    getProductionStyleLabel(entry.production_style) || '2d3d'
                  }`
                )
              }}
            </td>
            <td class="fps" :data-label="$t('productions.fields.fps')">
              {{ entry.fps }}
            </td>
            <td class="ratio" :data-label="$t('productions.fields.ratio')">
              {{ entry.ratio }}
            </td>
            <td
              class="resolution"
              :data-label="$t('productions.fields.resolution')"
            >
              {{ entry.resolution }}
            </td>
            <td
              class="metadata-descriptor"
              :key="entry.id + '-pm-closed-' + d.field_name"
              v-for="d in visibleProjectMetadataDescriptors"
            >
              <metadata-input
                :entity="entry"
                :descriptor="
                  getProjectDescriptorForField(entry, d.field_name) || d
                "
                :indexes="{ i: 0, j: 0, k: 0 }"
                @metadata-changed="onProjectMetadataInCell"
              />
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
      {{ displayedCount }}
      {{ $t('productions.number', { count: displayedCount }) }}
    </p>
  </div>
</template>

<script setup>
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { PRODUCTION_STYLE_OPTIONS } from '@/lib/productions'

import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import ProductionStats from '@/components/pages/production/ProductionStats.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  metadataDisplayHeaders: { type: Object, default: () => ({}) },
  groupBy: { type: String, default: '' },
  productionStats: { type: Object, default: () => ({}) },
  search: { type: String, default: '' }
})

const emit = defineEmits([
  'add-metadata',
  'delete-clicked',
  'delete-metadata',
  'edit-clicked',
  'edit-metadata',
  'metadata-changed',
  'update:metadata-display-headers'
])

const { t } = useI18n()
const store = useStore()

// State

const closedSectionExpanded = ref(false)
const columnSelectorDisplayed = ref(false)
const headerMetadataMenu = ref(null)
const lastMetadataHeaderMenuColumn = ref(null)

// Computed

const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const lastProductionScreen = computed(() => store.getters.lastProductionScreen)
const mergedProjectMetadataDescriptors = computed(
  () => store.getters.mergedProjectMetadataDescriptors
)
const searchQuery = computed(() => props.search.trim().toLowerCase())

const matchSearch = production =>
  !searchQuery.value ||
  `${production.name} ${production.code || ''}`
    .toLowerCase()
    .includes(searchQuery.value)

const openProductions = computed(() =>
  store.getters.openProductions.filter(matchSearch)
)

const closedProductions = computed(() =>
  props.entries.filter(
    p => p.project_status_name === 'Closed' && matchSearch(p)
  )
)

const groupLabel = production => {
  if (props.groupBy === 'production_type') {
    return t(`productions.type.${production.production_type || 'short'}`)
  }
  if (props.groupBy === 'production_style') {
    const style = getProductionStyleLabel(production.production_style)
    return t(`productions.style.${style || '2d3d'}`)
  }
  return production.data?.[props.groupBy] || t('main.none')
}

const openSections = computed(() => {
  if (!props.groupBy) {
    return [
      {
        label: t('productions.status.open'),
        productions: openProductions.value
      }
    ]
  }
  const groups = new Map()
  openProductions.value.forEach(production => {
    const label = groupLabel(production)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(production)
  })
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, productions]) => ({ label, productions }))
})

// A match hidden inside the collapsed section would look like no match at all.
const isClosedSectionDisplayed = computed(
  () => closedSectionExpanded.value || searchQuery.value.length > 0
)

const displayedClosedProductions = computed(() =>
  isClosedSectionDisplayed.value ? closedProductions.value : []
)

const displayedCount = computed(
  () => openProductions.value.length + displayedClosedProductions.value.length
)

const visibleProjectMetadataDescriptors = computed(() =>
  mergedProjectMetadataDescriptors.value.filter(d => {
    const header = props.metadataDisplayHeaders[d.field_name]
    return header === undefined || header
  })
)

const isProjectMetadataMenuEditAllowed = computed(() => {
  const fieldName = lastMetadataHeaderMenuColumn.value
  if (!fieldName) return false
  const d = visibleProjectMetadataDescriptors.value.find(
    x => x.field_name === fieldName
  )
  if (!d) return false
  return isCurrentUserManager.value || isCurrentUserSupervisor.value
})

// Cache project descriptors per (entryId, fieldName) so the template doesn't
// re-scan `production.descriptors` twice per cell on every render.
const projectDescriptorMap = computed(() => {
  const map = new Map()
  props.entries.forEach(entry => {
    const inner = new Map()
    ;(entry.descriptors || []).forEach(descriptor => {
      if (descriptor.entity_type === 'Project') {
        inner.set(descriptor.field_name, descriptor)
      }
    })
    map.set(entry.id, inner)
  })
  return map
})

// Functions

const showMetadataHeaderMenu = (columnId, event) => {
  const headerMenuEl = headerMetadataMenu.value?.$el
  if (!headerMenuEl) return
  if (headerMenuEl.className === 'header-menu') {
    headerMenuEl.className = 'header-menu hidden'
  } else if (event) {
    headerMenuEl.className = 'header-menu'
    const headerElement = event.srcElement.parentNode.parentNode
    const headerBox = headerElement.getBoundingClientRect()
    headerMenuEl.style.left = `${headerBox.left - 3}px`
    headerMenuEl.style.top = `${headerBox.bottom + 11}px`
    headerMenuEl.style.width = `${Math.max(100, headerBox.width - 1)}px`
  }
  lastMetadataHeaderMenuColumn.value = columnId
}

const onEditMetadataClicked = () => {
  emit('edit-metadata', lastMetadataHeaderMenuColumn.value)
  showMetadataHeaderMenu()
}

const onDeleteMetadataClicked = () => {
  emit('delete-metadata', lastMetadataHeaderMenuColumn.value)
  showMetadataHeaderMenu()
}

const onAddMetadataClick = () => emit('add-metadata')

const onAllProjectsMetadataReorder = ordered =>
  store.dispatch('reorderAllProjectsProjectMetadata', {
    entityType: 'Project',
    fieldOrder: (ordered || []).map(d => d.field_name)
  })

const toggleClosedSection = () => {
  closedSectionExpanded.value = !closedSectionExpanded.value
}

const toggleColumnSelector = () => {
  columnSelectorDisplayed.value = !columnSelectorDisplayed.value
}

const getProductionStyleLabel = value =>
  PRODUCTION_STYLE_OPTIONS.find(style => style.value === value)?.label

const getProjectDescriptorForField = (production, fieldName) =>
  projectDescriptorMap.value.get(production.id)?.get(fieldName) || null

const onProjectMetadataInCell = ({ entry, descriptor, value }) => {
  emit('metadata-changed', { entry, descriptor, value })
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
}

.fps,
.ratio,
.resolution {
  width: 110px;
  min-width: 110px;
  padding: 10px;
  text-align: right;
}

.section-toggle {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: 0.3em;
}

@media screen and (max-width: 768px) {
  :deep(.datatable-wrapper) {
    background: transparent;
    border: 0;
    overflow-x: visible;
  }

  .datatable-type-header th {
    display: block;
    padding: 0.5em 0;
  }

  .datatable.datatable--cards {
    // two fields per line: six stacked one-word fields make a tall card
    .datatable-row {
      flex-direction: row;
      flex-wrap: wrap;
    }

    // the name is a th, out of the shared td rules
    .datatable-row th.name {
      background: transparent !important;
      border: 0;
      display: block;
      font-size: 1.05em;
      font-weight: 600;
      min-width: 0;
      padding: 0.25em 0 0.5em;
      position: static;
      width: 100%;

      &::after {
        display: none;
      }
    }

    .datatable-body td[data-label] {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.2em;
      justify-content: flex-start;
      text-align: left;
      width: 50%;
    }
  }

  // Mobile is read-only: no stats row (its loading button lives in the
  // page header, hidden on mobile).
  .stats-row {
    display: none;
  }
}
</style>
