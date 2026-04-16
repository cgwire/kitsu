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
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditStudiosModal from '@/components/modals/EditStudiosModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import StudioList from '@/components/lists/StudioList.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const activeTab = ref('active')
const studioToEdit = ref(null)
const studioToDelete = ref(null)
const errors = reactive({ studios: false, edit: false, del: false })
const loading = reactive({ studios: false, edit: false, del: false })
const modals = reactive({ del: false, edit: false })

const studios = computed(() => store.getters.studios)
const archivedStudios = computed(() => store.getters.archivedStudios)

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const isActiveTab = computed(() => activeTab.value === 'active')

const displayedStudios = computed(() =>
  isActiveTab.value ? studios.value : archivedStudios.value
)

const deleteText = computed(() =>
  studioToDelete.value
    ? t('studios.delete_text', { name: studioToDelete.value.name })
    : ''
)

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('studios.title'))
  const headers = [
    t('main.type'),
    t('studios.fields.name'),
    t('studios.fields.color')
  ]
  const entries = [headers].concat(
    studios.value.map(studio => [studio.type, studio.name, studio.color])
  )
  csv.buildCsvFile(name, entries)
}

const onNewClicked = () => {
  studioToEdit.value = { name: '', color: '#999999' }
  modals.edit = true
}

const onEditClicked = studio => {
  studioToEdit.value = studio
  modals.edit = true
}

const confirmEditStudio = async form => {
  loading.edit = true
  errors.edit = false
  form.id = studioToEdit.value?.id
  try {
    if (form.id) {
      await store.dispatch('editStudio', form)
    } else {
      await store.dispatch('newStudio', form)
    }
    modals.edit = false
  } catch (error) {
    console.error(error)
    errors.edit = true
  }
  loading.edit = false
}

const onDeleteClicked = studio => {
  studioToDelete.value = studio
  modals.del = true
}

const confirmDeleteStudio = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteStudio', studioToDelete.value)
    modals.del = false
  } catch (error) {
    console.error(error)
    errors.del = true
  }
  loading.del = false
}

watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tab || 'active'
  }
)

onMounted(async () => {
  activeTab.value = route.query.tab || 'active'
  loading.studios = true
  errors.studios = false
  try {
    await store.dispatch('loadStudios')
  } catch (error) {
    console.error(error)
    errors.studios = true
  }
  loading.studios = false
})

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
