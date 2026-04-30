<template>
  <div class="departments page fixed-page">
    <list-page-header
      :title="$t('departments.title')"
      :new-entry-label="$t('departments.new_departments')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="tabs" :active-tab="activeTab" :tabs="tabs" />

    <department-list
      class="department-list"
      :entries="departmentList"
      :is-loading="loading.departments"
      :is-error="errors.departments"
      :linked-hardware-items="linkedHardwareItems"
      :linked-software-licenses="linkedSoftwareLicenses"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
      v-if="activeTab === 'active' || activeTab === 'archived'"
    />

    <department-links
      :type="activeTab"
      :linked-items="linkedItems"
      :items="items"
      @link-item="onLinkItem"
      @unlink-item="onUnlinkItem"
      v-if="activeTab === 'linked-hardware' || activeTab === 'linked-software'"
    />

    <edit-departments-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :department-to-edit="departmentToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditDepartment"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('departments.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteDepartment"
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
import DepartmentList from '@/components/lists/DepartmentList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditDepartmentsModal from '@/components/modals/EditDepartmentsModal.vue'
import DepartmentLinks from '@/components/pages/departments/DepartmentLinks.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const departmentToDelete = ref(null)
const departmentToEdit = ref(null)
const linkedHardwareItems = ref({})
const linkedSoftwareLicenses = ref({})

const errors = reactive({ del: false, departments: false, edit: false })
const loading = reactive({ del: false, departments: false, edit: false })
const modals = reactive({ del: false, edit: false })

// Computed

const archivedDepartments = computed(() => store.getters.archivedDepartments)
const departments = computed(() => store.getters.departments)
const hardwareItems = computed(() => store.getters.hardwareItems)
const softwareLicenses = computed(() => store.getters.softwareLicenses)

const isActiveTab = computed(() => activeTab.value === 'active')

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') },
  { name: 'linked-hardware', label: t('departments.linked_hardware') },
  { name: 'linked-software', label: t('departments.linked_software') }
])

const departmentList = computed(() =>
  isActiveTab.value ? departments.value : archivedDepartments.value
)

const deleteText = computed(() =>
  departmentToDelete.value
    ? t('departments.delete_text', { name: departmentToDelete.value.name })
    : ''
)

const linkedItems = computed(() =>
  activeTab.value === 'linked-hardware'
    ? linkedHardwareItems.value
    : linkedSoftwareLicenses.value
)

const items = computed(() =>
  activeTab.value === 'linked-hardware'
    ? hardwareItems.value
    : softwareLicenses.value
)

// Functions

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('departments.title'))
  const headers = [
    t('main.type'),
    t('departments.fields.name'),
    t('departments.fields.color')
  ]
  const rows = departments.value.map(department => [
    department.type,
    department.name,
    department.color
  ])
  csv.buildCsvFile(name, [headers, ...rows])
}

const onNewClicked = () => {
  departmentToEdit.value = { name: '', color: '#999999' }
  modals.edit = true
}

const onEditClicked = department => {
  departmentToEdit.value = department
  modals.edit = true
}

const onDeleteClicked = department => {
  departmentToDelete.value = department
  modals.del = true
}

const confirmEditDepartment = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (departmentToEdit.value?.id) {
      await store.dispatch('editDepartment', {
        ...form,
        id: departmentToEdit.value.id
      })
    } else {
      await store.dispatch('newDepartment', form)
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteDepartment = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteDepartment', departmentToDelete.value)
    modals.del = false
  } catch (err) {
    console.error(err)
    errors.del = true
  }
  loading.del = false
}

const onLinkItem = ({ itemId, departmentId }) => {
  if (activeTab.value === 'linked-hardware') {
    store.dispatch('linkHardwareItem', {
      hardwareItemId: itemId,
      departmentId
    })
    const item = hardwareItems.value.find(i => i.id === itemId)
    if (!linkedHardwareItems.value[departmentId]) {
      linkedHardwareItems.value[departmentId] = []
    }
    linkedHardwareItems.value[departmentId].push(item)
  } else if (activeTab.value === 'linked-software') {
    store.dispatch('linkSoftwareLicense', {
      softwareLicenseId: itemId,
      departmentId
    })
    const item = softwareLicenses.value.find(i => i.id === itemId)
    if (!linkedSoftwareLicenses.value[departmentId]) {
      linkedSoftwareLicenses.value[departmentId] = []
    }
    linkedSoftwareLicenses.value[departmentId].push(item)
  }
}

const onUnlinkItem = ({ itemId, departmentId }) => {
  if (activeTab.value === 'linked-hardware') {
    store.dispatch('unlinkHardwareItem', {
      hardwareItemId: itemId,
      departmentId
    })
    linkedHardwareItems.value[departmentId] = linkedHardwareItems.value[
      departmentId
    ].filter(i => i.id !== itemId)
  } else if (activeTab.value === 'linked-software') {
    store.dispatch('unlinkSoftwareLicense', {
      softwareLicenseId: itemId,
      departmentId
    })
    linkedSoftwareLicenses.value[departmentId] = linkedSoftwareLicenses.value[
      departmentId
    ].filter(i => i.id !== itemId)
  }
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
  loading.departments = true
  errors.departments = false
  try {
    await store.dispatch('loadDepartments')
    await store.dispatch('loadHardwareItems')
    await store.dispatch('loadSoftwareLicenses')
    linkedHardwareItems.value = await store.dispatch('loadLinkedHardwareItems')
    linkedSoftwareLicenses.value = await store.dispatch(
      'loadLinkedSoftwareLicenses'
    )
  } catch (err) {
    console.error(err)
    errors.departments = true
  }
  loading.departments = false
})

// Head

useHead({ title: computed(() => `${t('departments.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.department-list {
  margin-top: 0;
}

.tabs {
  min-height: 30px;
  margin-top: 1em;
}

@media screen and (max-width: 768px) {
  .departments {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}
</style>
