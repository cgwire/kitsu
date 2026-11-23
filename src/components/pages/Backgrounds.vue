<template>
  <div class="backgrounds page fixed-page">
    <list-page-header
      class="mt2 mb1"
      :active-tab="activeTab"
      :tabs="tabs"
      :new-entry-label="$t('backgrounds.new_background')"
      :is-exportable="false"
      @new-clicked="onNewClicked"
    />

    <background-list
      class="background-list"
      :entries="backgroundsList"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-background-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :background-to-edit="backgroundToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditBackground"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('backgrounds.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteBackground"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import BackgroundList from '@/components/lists/BackgroundList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditBackgroundModal from '@/components/modals/EditBackgroundModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const backgroundToEdit = ref({})
const backgroundToDelete = ref({})
const modals = reactive({ edit: false, del: false })
const loading = reactive({ edit: false, del: false, list: false })
const errors = reactive({ edit: false, del: false, list: false })

// Computed

const backgrounds = computed(() => store.getters.backgrounds)
const archivedBackgrounds = computed(() => store.getters.archivedBackgrounds)

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const backgroundsList = computed(() =>
  activeTab.value === 'active' ? backgrounds.value : archivedBackgrounds.value
)

const deleteText = computed(() =>
  backgroundToDelete.value
    ? t('backgrounds.delete_text', { name: backgroundToDelete.value.name })
    : ''
)

// Functions

const confirmEditBackground = form => {
  const isNew = !backgroundToEdit.value?.id
  let action = 'newBackground'
  if (!isNew) {
    action = 'saveBackground'
    form.id = backgroundToEdit.value.id
  }

  loading.edit = true
  errors.edit = false
  store
    .dispatch(action, form)
    .then(() => {
      modals.edit = false
    })
    .catch(err => {
      console.error(err)
      errors.edit = true
    })
    .finally(() => {
      loading.edit = false
    })
}

const confirmDeleteBackground = () => {
  loading.del = true
  errors.del = false
  store
    .dispatch('deleteBackground', backgroundToDelete.value)
    .then(() => {
      modals.del = false
    })
    .catch(err => {
      console.error(err)
      errors.del = true
    })
    .finally(() => {
      loading.del = false
    })
}

// A save or a deletion can still fail after Cancel: its error is cleared on
// opening, not on closing.
const onNewClicked = () => {
  backgroundToEdit.value = {}
  errors.edit = false
  modals.edit = true
}

const onEditClicked = background => {
  backgroundToEdit.value = background
  errors.edit = false
  modals.edit = true
}

const onDeleteClicked = background => {
  backgroundToDelete.value = background
  errors.del = false
  modals.del = true
}

// Watchers

watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tab || 'active'
  }
)

// Lifecycle

onMounted(() => {
  activeTab.value = route.query.tab || 'active'
})

// Head

useHead({ title: computed(() => `${t('backgrounds.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.background-list {
  margin-top: 0;
}
</style>
