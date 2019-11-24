<template>
  <div class="productions page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title :text="$t('productions.title')" />
      </div>
      <div class="level-right">
        <div class="level-item">
          <button-link
            class="level-item"
            :text="$t('productions.new_production')"
            icon="plus"
            path="/productions/new"
          />
        </div>
      </div>
    </div>

    <production-list
      :entries="productions"
      :is-loading="isProductionsLoading"
      :is-error="isProductionsLoadingError"
    />

    <edit-production-modal
      :active="modals.isNewDisplayed"
      :is-loading="editProduction.isLoading"
      :is-error="editProduction.isError"
      :cancel-route="'/productions'"
      :production-to-edit="productionToEdit"
      @fileselected="onProductionPictureSelected"
      @confirm="confirmEditProduction"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteProduction.isLoading"
      :is-error="deleteProduction.isError"
      :cancel-route="{name: 'productions'}"
      :text="deleteText()"
      :error-text="$t('productions.delete_error')"
      :lock-text="currentLockText"
      @confirm="confirmDeleteProduction"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionList from '../lists/ProductionList'
import EditProductionModal from '../modals/EditProductionModal'
import HardDeleteModal from '../modals/HardDeleteModal'
import ButtonLink from '../widgets/ButtonLink'
import PageTitle from '../widgets/PageTitle'

export default {
  name: 'productions',

  components: {
    ButtonLink,
    HardDeleteModal,
    EditProductionModal,
    PageTitle,
    ProductionList
  },

  data () {
    return {
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
      'deleteProduction',
      'editProduction',
      'getProduction',
      'isProductionsLoading',
      'isProductionsLoadingError',
      'productionAvatarFormData',
      'productions'
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
    this.loadProductions((err) => {
      if (!err) this.handleModalsDisplay()
    })
  },

  methods: {
    ...mapActions([
      'loadProductions',
      'storeProductionPicture',
      'uploadProductionAvatar'
    ]),

    confirmEditProduction (form) {
      let action = 'newProduction'
      const isEditing = this.productionToEdit && this.productionToEdit.id
      if (this.productionToEdit && this.productionToEdit.id) {
        action = 'editProduction'
        form.id = this.productionToEdit.id
      }

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          if (!err) {
            if (isEditing && this.productionAvatarFormData) {
              this.uploadProductionAvatar(form.id)
                .then(() => {
                  this.modals.isNewDisplayed = false
                  this.$router.push('/productions')
                })
            } else {
              this.modals.isNewDisplayed = false
              this.$router.push('/productions')
            }
          }
        }
      })
    },

    confirmDeleteProduction () {
      this.$store.dispatch('deleteProduction', {
        production: this.productionToDelete,
        callback: (err) => {
          if (!err) this.modals.isDeleteDisplayed = false
        }
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

    handleModalsDisplay () {
      const path = this.$store.state.route.path

      if (path.indexOf('new') > 0) {
        this.productionToEdit = {}
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        const productionId = this.$store.state.route.params.production_edit_id
        this.productionToEdit = this.getProduction(productionId)
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        const productionId = this.$store.state.route.params.production_delete_id
        this.productionToDelete = this.getProduction(productionId)
        this.modals.isDeleteDisplayed = true
      } else {
        this.modals.isNewDisplayed = false
        this.modals.isDeleteDisplayed = false
      }
    },

    onProductionPictureSelected (formData) {
      this.storeProductionPicture(formData)
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() }
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
