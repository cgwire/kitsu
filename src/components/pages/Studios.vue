<template>
  <div class="studios page fixed-page">
    <list-page-header
      :title="$t('studios.title')"
      :new-entry-label="$t('studios.new_studios')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <studio-list
      class="studio-list"
      :entries="displayedStudios"
      :is-loading="loading.studios"
      :is-error="errors.studios"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-studios-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :studio-to-edit="studioToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditStudio"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('studios.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteStudio"
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

import StudioList from '@/components/lists/StudioList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditStudiosModal from '@/components/modals/EditStudiosModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const studioToDelete = ref(null)
const studioToEdit = ref(null)

const errors = reactive({ del: false, edit: false, studios: false })
const loading = reactive({ del: false, edit: false, studios: false })
const modals = reactive({ del: false, edit: false })

// Computed

const archivedStudios = computed(() => store.getters.archivedStudios)
const studios = computed(() => store.getters.studios)

const isActiveTab = computed(() => activeTab.value === 'active')

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const displayedStudios = computed(() =>
  isActiveTab.value ? studios.value : archivedStudios.value
)

const deleteText = computed(() =>
  studioToDelete.value
    ? t('studios.delete_text', { name: studioToDelete.value.name })
    : ''
)

// Functions

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('studios.title'))
  const headers = [
    t('main.type'),
    t('studios.fields.name'),
    t('studios.fields.color')
  ]
  const rows = studios.value.map(studio => [
    studio.type,
    studio.name,
    studio.color
  ])
  csv.buildCsvFile(name, [headers, ...rows])
}

const onNewClicked = () => {
  studioToEdit.value = { name: '', color: '#999999' }
  modals.edit = true
}

const onEditClicked = studio => {
  studioToEdit.value = studio
  modals.edit = true
}

const onDeleteClicked = studio => {
  studioToDelete.value = studio
  modals.del = true
}

const confirmEditStudio = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (studioToEdit.value?.id) {
      await store.dispatch('editStudio', { ...form, id: studioToEdit.value.id })
    } else {
      await store.dispatch('newStudio', form)
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteStudio = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteStudio', studioToDelete.value)
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
  loading.studios = true
  errors.studios = false
  try {
    await store.dispatch('loadStudios')
  } catch (err) {
    console.error(err)
    errors.studios = true
  }
  loading.studios = false
})

// Head

useHead({ title: computed(() => `${t('studios.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.studio-list {
  margin-top: 0;
}

@media screen and (max-width: 768px) {
  .studios {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}
</style>
