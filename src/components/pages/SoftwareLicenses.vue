<template>
  <div class="software-licenses page fixed-page">
    <list-page-header
      :title="$t('software_licenses.title')"
      :new-entry-label="$t('software_licenses.new_software_license')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <software-license-list
      class="software-license-list"
      :entries="softwareLicensesList"
      :is-loading="loading.list"
      :is-error="errors.list"
      :remaining-software-licenses="remainingSoftwareLicenses"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-software-license-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :software-license-to-edit="softwareLicenseToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditSoftwareLicense"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('software_licenses.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteSoftwareLicense"
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
import SoftwareLicenseList from '@/components/lists/SoftwareLicenseList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditSoftwareLicenseModal from '@/components/modals/EditSoftwareLicenseModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const linkedSoftwareLicenses = ref({})
const softwareLicenseToDelete = ref(null)
const softwareLicenseToEdit = ref({})

const errors = reactive({ del: false, edit: false, list: false })
const loading = reactive({ del: false, edit: false, list: false })
const modals = reactive({ del: false, edit: false })

// Computed

const activePeople = computed(() => store.getters.activePeople)
const archivedSoftwareLicenses = computed(
  () => store.getters.archivedSoftwareLicenses
)
const softwareLicenses = computed(() => store.getters.softwareLicenses)

const isActiveTab = computed(() => activeTab.value === 'active')

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const softwareLicensesList = computed(() =>
  isActiveTab.value ? softwareLicenses.value : archivedSoftwareLicenses.value
)

const deleteText = computed(() =>
  softwareLicenseToDelete.value
    ? t('software_licenses.delete_text', {
        name: softwareLicenseToDelete.value.name
      })
    : ''
)

const usedAmounts = computed(() => {
  const amounts = {}
  activePeople.value.forEach(person => {
    person.departments.forEach(departmentId => {
      const departmentItems = linkedSoftwareLicenses.value[departmentId] || []
      departmentItems.forEach(item => {
        amounts[item.id] = (amounts[item.id] || 0) + 1
      })
    })
  })
  return amounts
})

const remainingSoftwareLicenses = computed(() =>
  softwareLicenses.value.reduce((remaining, license) => {
    remaining[license.id] =
      license.inventory_amount - (usedAmounts.value[license.id] || 0)
    return remaining
  }, {})
)

// Functions

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('software_licenses.title'))
  const headers = [
    t('main.type'),
    t('software_licenses.fields.name'),
    t('software_licenses.fields.short_name'),
    t('software_licenses.fields.extension'),
    t('software_licenses.fields.version'),
    t('software_licenses.fields.monthly_cost'),
    t('software_licenses.fields.inventory_amount')
  ]
  const rows = softwareLicenses.value.map(softwareLicense => [
    softwareLicense.type,
    softwareLicense.name,
    softwareLicense.short_name,
    softwareLicense.file_extension,
    softwareLicense.version,
    softwareLicense.monthly_cost,
    softwareLicense.inventory_amount
  ])
  csv.buildCsvFile(name, [headers, ...rows])
}

const onNewClicked = () => {
  softwareLicenseToEdit.value = {}
  errors.edit = false
  modals.edit = true
}

const onEditClicked = softwareLicense => {
  softwareLicenseToEdit.value = softwareLicense
  errors.edit = false
  modals.edit = true
}

const onDeleteClicked = softwareLicense => {
  softwareLicenseToDelete.value = softwareLicense
  errors.del = false
  modals.del = true
}

const confirmEditSoftwareLicense = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (softwareLicenseToEdit.value?.id) {
      await store.dispatch('editSoftwareLicense', {
        ...form,
        id: softwareLicenseToEdit.value.id
      })
    } else {
      await store.dispatch('newSoftwareLicense', form)
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteSoftwareLicense = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteSoftwareLicense', softwareLicenseToDelete.value)
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
  linkedSoftwareLicenses.value = await store.dispatch(
    'loadLinkedSoftwareLicenses'
  )
})

// Head

useHead({ title: computed(() => `${t('software_licenses.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.software-license-list {
  margin-top: 0;
}

@media screen and (max-width: 768px) {
  .software-licenses {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}
</style>
