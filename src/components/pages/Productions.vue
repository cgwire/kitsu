<template>
  <div class="productions page fixed-page">
    <div class="flexrow page-header">
      <page-title class="filler" :text="$t('productions.title')" />
      <button-simple
        class="flexrow-item"
        :text="$t('productions.load_stats')"
        :is-loading="loading.stats"
        @click="reloadStats"
      />
      <button-link
        class="flexrow-item"
        :text="$t('productions.new_production')"
        icon="plus"
        :path="{ name: 'new-production' }"
      />
    </div>

    <production-list
      v-model:metadata-display-headers="metadataDisplayHeaders"
      :entries="productions"
      :production-stats="productionStats"
      :is-loading="isProductionsLoading"
      :is-error="isProductionsLoadingError"
      @add-metadata="onAddProjectMetadata"
      @delete-clicked="onDeleteClicked"
      @delete-metadata="onDeleteProjectMetadataField"
      @edit-clicked="onEditClicked"
      @edit-metadata="onEditProjectMetadata"
      @metadata-changed="onProjectMetadataChanged"
    />

    <edit-production-modal
      active
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :production-to-edit="productionToEdit"
      @cancel="modals.isEditDisplayed = false"
      @fileselected="onProductionPictureSelected"
      @confirm="confirmEditProduction"
      v-if="modals.isEditDisplayed"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('productions.delete_error')"
      :lock-text="currentLockText"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteProduction"
    />

    <add-metadata-modal
      :active="modals.isAddProjectMetadata"
      :descriptor-to-edit="descriptorToEdit"
      :is-loading="loading.addMetadata"
      :is-error="errors.addMetadata"
      entity-type="Project"
      @cancel="onCancelAddProjectMetadata"
      @confirm="confirmAddProjectMetadata"
    />

    <delete-modal
      :active="modals.isDeleteProjectMetadata"
      :is-loading="loading.deleteProjectMetadata"
      :is-error="errors.deleteProjectMetadata"
      :text="deleteProjectMetadataText"
      :error-text="$t('productions.metadata.delete_error')"
      @cancel="onCancelDeleteProjectMetadata"
      @confirm="confirmDeleteProjectMetadata"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditProductionModal from '@/components/modals/EditProductionModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ProductionList from '@/components/lists/ProductionList.vue'
import ButtonLink from '@/components/widgets/ButtonLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

const { t } = useI18n()
const store = useStore()

const metadataDisplayHeaders = ref({})
const descriptorToEdit = ref(null)
const fieldNameForDeleteMetadata = ref(null)
const productionStats = ref({})
const productionToDelete = ref(null)
const productionToEdit = ref(null)

const errors = reactive({
  addMetadata: false,
  deleteProjectMetadata: false,
  del: false,
  edit: false
})

const loading = reactive({
  addMetadata: false,
  deleteProjectMetadata: false,
  del: false,
  edit: false,
  stats: false
})

const modals = reactive({
  isAddProjectMetadata: false,
  isEditDisplayed: false,
  isDeleteDisplayed: false,
  isDeleteProjectMetadata: false
})

const isProductionsLoading = computed(() => store.getters.isProductionsLoading)
const isProductionsLoadingError = computed(
  () => store.getters.isProductionsLoadingError
)
const productionAvatarFormData = computed(
  () => store.getters.productionAvatarFormData
)
const productions = computed(() => store.getters.productions)

const findFirstProjectDescriptorByFieldName = fieldName => {
  if (!fieldName) return null
  return (
    productions.value
      .map(p =>
        p.descriptors?.find(
          d => d.entity_type === 'Project' && d.field_name === fieldName
        )
      )
      .find(Boolean) || null
  )
}

const currentLockText = computed(() => productionToDelete.value?.name || '')

const deleteProjectMetadataText = computed(() => {
  const d = findFirstProjectDescriptorByFieldName(
    fieldNameForDeleteMetadata.value
  )
  const colName = d?.name || fieldNameForDeleteMetadata.value || '—'
  return t('productions.metadata.delete_list_column_text', { name: colName })
})

const deleteText = () => {
  const production = productionToDelete.value
  return production
    ? t('productions.delete_text', { name: production.name })
    : ''
}

const confirmEditProduction = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (productionAvatarFormData.value) {
      await store.dispatch('uploadProductionAvatar', productionToEdit.value.id)
    }
    await store.dispatch('editProduction', {
      ...form,
      id: productionToEdit.value.id
    })
    modals.isEditDisplayed = false
  } catch (error) {
    console.error(error)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteProduction = () => {
  loading.del = true
  errors.del = false
  store
    .dispatch('deleteProduction', productionToDelete.value)
    .then(() => {
      modals.isDeleteDisplayed = false
    })
    .catch(err => {
      console.error(err)
      errors.del = true
    })
    .finally(() => {
      loading.del = false
    })
}

const onEditClicked = production => {
  store.dispatch('storeProductionPicture', null)
  productionToEdit.value = production
  modals.isEditDisplayed = true
}

const onDeleteClicked = production => {
  productionToDelete.value = production
  modals.isDeleteDisplayed = true
}

const onProductionPictureSelected = formData => {
  store.dispatch('storeProductionPicture', formData)
}

const onProjectMetadataChanged = ({ entry, descriptor, value }) =>
  store.dispatch('editProduction', {
    id: entry.id,
    data: { [descriptor.field_name]: value }
  })

const onAddProjectMetadata = () => {
  descriptorToEdit.value = null
  modals.isAddProjectMetadata = true
}

const onEditProjectMetadata = fieldName => {
  const d = findFirstProjectDescriptorByFieldName(fieldName)
  if (!d) return
  descriptorToEdit.value = { ...d }
  modals.isAddProjectMetadata = true
}

const onDeleteProjectMetadataField = fieldName => {
  fieldNameForDeleteMetadata.value = fieldName
  modals.isDeleteProjectMetadata = true
}

const onCancelAddProjectMetadata = () => {
  modals.isAddProjectMetadata = false
  descriptorToEdit.value = null
}

const onCancelDeleteProjectMetadata = () => {
  modals.isDeleteProjectMetadata = false
  fieldNameForDeleteMetadata.value = null
}

const confirmAddProjectMetadata = form => {
  loading.addMetadata = true
  errors.addMetadata = false
  const payload = { ...form, entity_type: 'Project' }
  const action = form.id
    ? store.dispatch('updateProjectMetadataOnAll', {
        fieldName: descriptorToEdit.value?.field_name,
        form: payload
      })
    : store.dispatch('addProjectMetadataDescriptorToAllProductions', payload)
  action
    .then(() => {
      modals.isAddProjectMetadata = false
      descriptorToEdit.value = null
    })
    .catch(err => {
      console.error(err)
      errors.addMetadata = true
    })
    .finally(() => {
      loading.addMetadata = false
    })
}

const confirmDeleteProjectMetadata = () => {
  loading.deleteProjectMetadata = true
  errors.deleteProjectMetadata = false
  store
    .dispatch(
      'deleteProjectMetadataByFieldName',
      fieldNameForDeleteMetadata.value
    )
    .then(() => {
      modals.isDeleteProjectMetadata = false
      fieldNameForDeleteMetadata.value = null
    })
    .catch(err => {
      console.error(err)
      errors.deleteProjectMetadata = true
    })
    .finally(() => {
      loading.deleteProjectMetadata = false
    })
}

const reloadStats = async () => {
  loading.stats = true
  productionStats.value = await store.dispatch('loadProductionStats')
  loading.stats = false
}

store.dispatch('loadProductions')

useHead({ title: computed(() => `${t('productions.title')} - Kitsu`) })
</script>
