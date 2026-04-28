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
      {{ entries.length }} {{ $t('productions.number', entries.length) }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { PRODUCTION_STYLE_OPTIONS } from '@/lib/productions'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import ProductionStats from '@/components/pages/production/ProductionStats.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  metadataDisplayHeaders: { type: Object, default: () => ({}) },
  productionStats: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'add-metadata',
  'delete-clicked',
  'delete-metadata',
  'edit-clicked',
  'edit-metadata',
  'metadata-changed',
  'update:metadataDisplayHeaders'
])

const store = useStore()

const columnSelectorDisplayed = ref(false)
const headerMetadataMenu = ref(null)
const lastMetadataHeaderMenuColumn = ref(null)

const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const lastProductionScreen = computed(() => store.getters.lastProductionScreen)
const mergedProjectMetadataDescriptors = computed(
  () => store.getters.mergedProjectMetadataDescriptors
)
const openProductions = computed(() => store.getters.openProductions)

const closedProductions = computed(() =>
  props.entries.filter(p => p.project_status_name === 'Closed')
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
