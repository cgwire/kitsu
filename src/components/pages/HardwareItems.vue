<template>
  <div class="hardware-items page fixed-page">
    <list-page-header
      :title="$t('hardware_items.title')"
      :new-entry-label="$t('hardware_items.new_hardware_item')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <hardware-item-list
      class="hardware-item-list"
      :entries="hardwareItemsList"
      :is-loading="loading.list"
      :is-error="errors.list"
      :remaining-hardware-items="remainingHardwareItems"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-hardware-item-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :hardware-item-to-edit="hardwareItemToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditHardwareItem"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('hardware_items.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteHardwareItem"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

// eslint-disable-next-line no-unused-vars
import HardwareItemList from '@/components/lists/HardwareItemList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditHardwareItemModal from '@/components/modals/EditHardwareItemModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const hardwareItemToDelete = ref(null)
const hardwareItemToEdit = ref({})
const linkedHardwareItems = ref({})

const errors = reactive({ del: false, edit: false, list: false })
const loading = reactive({ del: false, edit: false, list: false })
const modals = reactive({ del: false, edit: false })

// Computed

const activePeople = computed(() => store.getters.activePeople)
const archivedHardwareItems = computed(
  () => store.getters.archivedHardwareItems
)
const hardwareItems = computed(() => store.getters.hardwareItems)

const isActiveTab = computed(() => activeTab.value === 'active')

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const hardwareItemsList = computed(() =>
  isActiveTab.value ? hardwareItems.value : archivedHardwareItems.value
)

const deleteText = computed(() =>
  hardwareItemToDelete.value
    ? t('hardware_items.delete_text', { name: hardwareItemToDelete.value.name })
    : ''
)

const usedAmounts = computed(() => {
  const amounts = {}
  activePeople.value.forEach(person => {
    person.departments.forEach(departmentId => {
      const departmentItems = linkedHardwareItems.value[departmentId] || []
      departmentItems.forEach(item => {
        amounts[item.id] = (amounts[item.id] || 0) + 1
      })
    })
  })
  return amounts
})

const remainingHardwareItems = computed(() =>
  hardwareItems.value.reduce((remaining, hardwareItem) => {
    remaining[hardwareItem.id] =
      hardwareItem.inventory_amount - (usedAmounts.value[hardwareItem.id] || 0)
    return remaining
  }, {})
)

// Functions

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('hardware_items.title'))
  const headers = [
    t('main.type'),
    t('hardware_items.fields.name'),
    t('hardware_items.fields.short_name'),
    t('hardware_items.fields.monthly_cost'),
    t('hardware_items.fields.inventory_amount')
  ]
  const rows = hardwareItems.value.map(hardwareItem => [
    hardwareItem.type,
    hardwareItem.name,
    hardwareItem.short_name,
    hardwareItem.monthly_cost,
    hardwareItem.inventory_amount
  ])
  csv.buildCsvFile(name, [headers, ...rows])
}

const onNewClicked = () => {
  hardwareItemToEdit.value = {}
  errors.edit = false
  modals.edit = true
}

const onEditClicked = hardwareItem => {
  hardwareItemToEdit.value = hardwareItem
  errors.edit = false
  modals.edit = true
}

const onDeleteClicked = hardwareItem => {
  hardwareItemToDelete.value = hardwareItem
  errors.del = false
  modals.del = true
}

const confirmEditHardwareItem = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (hardwareItemToEdit.value?.id) {
      await store.dispatch('editHardwareItem', {
        ...form,
        id: hardwareItemToEdit.value.id
      })
    } else {
      await store.dispatch('newHardwareItem', form)
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteHardwareItem = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteHardwareItem', hardwareItemToDelete.value)
    modals.del = false
  } catch (err) {
    console.error(err)
    errors.del = true
  }
  loading.del = false
}

// Watchers

watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tab || 'active'
  }
)

// Lifecycle

onMounted(async () => {
  activeTab.value = route.query.tab || 'active'
  linkedHardwareItems.value = await store.dispatch('loadLinkedHardwareItems')
})

// Head

useHead({ title: computed(() => `${t('hardware_items.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.hardware-item-list {
  margin-top: 0;
}

@media screen and (max-width: 768px) {
  .hardware-items {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}
</style>
