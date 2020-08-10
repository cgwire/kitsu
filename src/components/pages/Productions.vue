<template>
  <div class="productions page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title :text="$t('productions.title')" />
      </div>
      <div class="level-right">
        <div class="level-item">
          <button-simple
            class="level-item"
            :text="$t('productions.new_production')"
            icon="plus"
            @click="onNewClicked"
          />
        </div>
      </div>
    </div>

    <production-list
      :entries="productions"
      :is-loading="isProductionsLoading"
      :is-error="isProductionsLoadingError"
      @delete-clicked="onDeleteClicked"
      @edit-clicked="onEditClicked"
    />

    <edit-production-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :production-to-edit="productionToEdit"
      @cancel="modals.isNewDisplayed = false"
      @fileselected="onProductionPictureSelected"
      @confirm="confirmEditProduction"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('productions.delete_error')"
      :lock-text="currentLockText"
      @cancel="modals.isDeletDisplayed = false"
      @confirm="confirmDeleteProduction"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionList from '../lists/ProductionList'
import EditProductionModal from '../modals/EditProductionModal'
import HardDeleteModal from '../modals/HardDeleteModal'
import ButtonSimple from '../widgets/ButtonSimple'
import PageTitle from '../widgets/PageTitle'

export default {
  name: 'productions',

  components: {
    ButtonSimple,
    HardDeleteModal,
    EditProductionModal,
    PageTitle,
    ProductionList
  },

  data () {
    return {
      errors: {
        del: false,
        edit: false
      },
      loading: {
        del: false,
        edit: false
      },
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      productionToDelete: null,
      productionToEdit: null,
      choices: []
    }
  },

  computed: {
    ...mapGetters([
      'isProductionsLoading',
      'isProductionsLoadingError',
      'productionAvatarFormData',
      'productions',
      'productionMap'
    ]),

    currentLockText () {
      if (this.productionToDelete) {
        return this.productionToDelete.name
      } else {
        return ''
      }
    }
  },

  created () {
    this.loadProductions()
  },

  methods: {
    ...mapActions([
      'deleteProduction',
      'loadProductions',
      'storeProductionPicture',
      'uploadProductionAvatar'
    ]),

    // Actions

    confirmEditProduction (form) {
      let action = 'newProduction'
      const isEditing = this.productionToEdit && this.productionToEdit.id
      if (isEditing) {
        action = 'editProduction'
        form.id = this.productionToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this.$store.dispatch(action, form)
        .then(() => {
          if (isEditing && this.productionAvatarFormData) {
            return this.uploadProductionAvatar(form.id)
          } else {
            return Promise.resolve()
          }
        }).then(() => {
          this.modals.isNewDisplayed = false
          this.loading.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteProduction () {
      this.loading.del = true
      this.errors.del = false
      this.deleteProduction(this.productionToDelete)
        .then(() => {
          this.modals.isDeleteDisplayed = false
          this.loading.del = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    deleteText () {
      const production = this.productionToDelete
      if (production) {
        return this.$t('productions.delete_text', { name: production.name })
      } else {
        return ''
      }
    },

    // Events

    onEditClicked (production) {
      this.productionToEdit = production
      this.modals.isNewDisplayed = true
    },

    onDeleteClicked (production) {
      this.productionToDelete = production
      this.modals.isDeleteDisplayed = true
    },

    onNewClicked (production) {
      this.productionToEdit = {}
      this.modals.isNewDisplayed = true
    },

    onProductionPictureSelected (formData) {
      this.storeProductionPicture(formData)
    }
  },

  watch: {
  },

  metaInfo () {
    return {
      title: `${this.$t('productions.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
