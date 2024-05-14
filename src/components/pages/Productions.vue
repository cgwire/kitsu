<template>
  <div class="productions page fixed-page">
    <div class="flexrow page-header">
      <page-title :text="$t('productions.title')" />
      <div class="filler"></div>
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
      :entries="productions"
      :production-stats="productionStats"
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
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteProduction"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonLink from '@/components/widgets/ButtonLink'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import EditProductionModal from '@/components/modals/EditProductionModal'
import HardDeleteModal from '@/components/modals/HardDeleteModal'
import ProductionList from '@/components/lists/ProductionList'
import PageTitle from '@/components/widgets/PageTitle'

export default {
  name: 'productions',

  components: {
    ButtonLink,
    ButtonSimple,
    HardDeleteModal,
    EditProductionModal,
    PageTitle,
    ProductionList
  },

  data() {
    return {
      errors: {
        del: false,
        edit: false
      },
      loading: {
        del: false,
        edit: false,
        stats: false
      },
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      productionStats: {},
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
      'productions'
    ]),

    currentLockText() {
      return this.productionToDelete?.name || ''
    }
  },

  async created() {
    await this.loadProductions()
  },

  methods: {
    ...mapActions([
      'deleteProduction',
      'loadProductions',
      'loadProductionStats',
      'storeProductionPicture',
      'uploadProductionAvatar'
    ]),

    // Actions

    confirmEditProduction(form) {
      let action = 'newProduction'
      const isEditing = this.productionToEdit && this.productionToEdit.id
      if (isEditing) {
        action = 'editProduction'
        form.id = this.productionToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this.$store
        .dispatch(action, form)
        .then(() => {
          if (isEditing && this.productionAvatarFormData) {
            return this.uploadProductionAvatar(form.id)
          } else {
            return Promise.resolve()
          }
        })
        .then(() => {
          this.modals.isNewDisplayed = false
          this.loading.edit = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
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
      this.productionToEdit = production
      this.modals.isNewDisplayed = true
    },

    onDeleteClicked(production) {
      this.productionToDelete = production
      this.modals.isDeleteDisplayed = true
    },

    onNewClicked(production) {
      this.productionToEdit = {}
      this.modals.isNewDisplayed = true
    },

    onProductionPictureSelected(formData) {
      this.storeProductionPicture(formData)
    },

    async reloadStats() {
      this.loading.stats = true
      this.productionStats = await this.loadProductionStats()
      this.loading.stats = false
    }
  },

  watch: {},

  metaInfo() {
    return {
      title: `${this.$t('productions.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped></style>
