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

<script>
import { mapGetters, mapActions } from 'vuex'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ButtonLink from '@/components/widgets/ButtonLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import EditProductionModal from '@/components/modals/EditProductionModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ProductionList from '@/components/lists/ProductionList.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

export default {
  name: 'productions',

  components: {
    AddMetadataModal,
    DeleteModal,
    ButtonLink,
    ButtonSimple,
    HardDeleteModal,
    EditProductionModal,
    PageTitle,
    ProductionList
  },

  data() {
    return {
      metadataDisplayHeaders: {},
      descriptorToEdit: null,
      fieldNameForDeleteMetadata: null,
      errors: {
        addMetadata: false,
        deleteProjectMetadata: false,
        del: false,
        edit: false
      },
      loading: {
        addMetadata: false,
        deleteProjectMetadata: false,
        del: false,
        edit: false,
        stats: false
      },
      modals: {
        isAddProjectMetadata: false,
        isEditDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteProjectMetadata: false
      },
      productionStats: {},
      productionToDelete: null,
      productionToEdit: null
    }
  },

  computed: {
    ...mapGetters([
      'isProductionsLoading',
      'isProductionsLoadingError',
      'productionAvatarFormData',
      'productions'
    ]),

    currentLockText() {
      return this.productionToDelete?.name || ''
    },

    deleteProjectMetadataText() {
      const d = this.findFirstProjectDescriptorByFieldName(
        this.fieldNameForDeleteMetadata
      )
      const colName = d?.name || this.fieldNameForDeleteMetadata || '—'
      return this.$t('productions.metadata.delete_list_column_text', {
        name: colName
      })
    }
  },

  async created() {
    await this.loadProductions()
  },

  methods: {
    ...mapActions([
      'addProjectMetadataDescriptorToAllProductions',
      'deleteProjectMetadataByFieldName',
      'deleteProduction',
      'editProduction',
      'loadProductions',
      'loadProductionStats',
      'storeProductionPicture',
      'updateProjectMetadataOnAll',
      'uploadProductionAvatar'
    ]),

    // Actions

    async confirmEditProduction(form) {
      this.loading.edit = true
      this.errors.edit = false
      try {
        if (this.productionAvatarFormData) {
          await this.uploadProductionAvatar(this.productionToEdit.id)
        }
        await this.editProduction({
          ...form,
          id: this.productionToEdit.id
        })
        this.modals.isEditDisplayed = false
      } catch (error) {
        console.error(error)
        this.errors.edit = true
      }
      this.loading.edit = false
    },

    confirmDeleteProduction() {
      this.loading.del = true
      this.errors.del = false
      this.deleteProduction(this.productionToDelete)
        .then(() => {
          this.modals.isDeleteDisplayed = false
          this.loading.del = false
        })
        .catch(err => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    deleteText() {
      const production = this.productionToDelete
      if (production) {
        return this.$t('productions.delete_text', { name: production.name })
      } else {
        return ''
      }
    },

    // Events

    onEditClicked(production) {
      this.storeProductionPicture(null)
      this.productionToEdit = production
      this.modals.isEditDisplayed = true
    },

    onDeleteClicked(production) {
      this.productionToDelete = production
      this.modals.isDeleteDisplayed = true
    },

    onProductionPictureSelected(formData) {
      this.storeProductionPicture(formData)
    },

    onProjectMetadataChanged({ entry, descriptor, value }) {
      return this.editProduction({
        id: entry.id,
        data: { [descriptor.field_name]: value }
      })
    },

    findFirstProjectDescriptorByFieldName(fieldName) {
      if (!fieldName) return null
      return (
        this.productions
          .map(p =>
            p.descriptors?.find(
              d => d.entity_type === 'Project' && d.field_name === fieldName
            )
          )
          .find(Boolean) || null
      )
    },

    onAddProjectMetadata() {
      this.descriptorToEdit = null
      this.modals.isAddProjectMetadata = true
    },

    onEditProjectMetadata(fieldName) {
      const d = this.findFirstProjectDescriptorByFieldName(fieldName)
      if (!d) return
      this.descriptorToEdit = { ...d }
      this.modals.isAddProjectMetadata = true
    },

    onDeleteProjectMetadataField(fieldName) {
      this.fieldNameForDeleteMetadata = fieldName
      this.modals.isDeleteProjectMetadata = true
    },

    onCancelAddProjectMetadata() {
      this.modals.isAddProjectMetadata = false
      this.descriptorToEdit = null
    },

    onCancelDeleteProjectMetadata() {
      this.modals.isDeleteProjectMetadata = false
      this.fieldNameForDeleteMetadata = null
    },

    confirmAddProjectMetadata(form) {
      this.loading.addMetadata = true
      this.errors.addMetadata = false
      const payload = { ...form, entity_type: 'Project' }
      const action = form.id
        ? this.updateProjectMetadataOnAll({
            fieldName: this.descriptorToEdit?.field_name,
            form: payload
          })
        : this.addProjectMetadataDescriptorToAllProductions(payload)
      action
        .then(() => {
          this.modals.isAddProjectMetadata = false
          this.descriptorToEdit = null
        })
        .catch(err => {
          console.error(err)
          this.errors.addMetadata = true
        })
        .finally(() => {
          this.loading.addMetadata = false
        })
    },

    confirmDeleteProjectMetadata() {
      this.loading.deleteProjectMetadata = true
      this.errors.deleteProjectMetadata = false
      this.deleteProjectMetadataByFieldName(this.fieldNameForDeleteMetadata)
        .then(() => {
          this.modals.isDeleteProjectMetadata = false
          this.fieldNameForDeleteMetadata = null
        })
        .catch(err => {
          console.error(err)
          this.errors.deleteProjectMetadata = true
        })
        .finally(() => {
          this.loading.deleteProjectMetadata = false
        })
    },

    async reloadStats() {
      this.loading.stats = true
      this.productionStats = await this.loadProductionStats()
      this.loading.stats = false
    }
  },

  head() {
    return {
      title: `${this.$t('productions.title')} - Kitsu`
    }
  }
}
</script>
