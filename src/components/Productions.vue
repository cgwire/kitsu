<template>
  <div class="productions page fixed-page">
    <div class="level page-header">
      <div class="level-left">
        <page-title :text="$t('productions.title')"></page-title>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button-link
            class="level-item"
            :text="$t('productions.new_production')"
            icon="plus"
            path="/productions/new"
          >
          </button-link>
        </div>
      </div>
    </div>

    <production-list
      :entries="productions"
      :is-loading="isProductionsLoading"
      :is-error="isProductionsLoadingError"
    ></production-list>

    <edit-production-modal
      :active="modals.isNewDisplayed"
      :is-loading="editProduction.isLoading"
      :is-error="editProduction.isError"
      :cancel-route="'/productions'"
      :production-to-edit="productionToEdit"
      @confirm="confirmEditProduction"
    >
    </edit-production-modal>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteProduction.isLoading"
      :is-error="deleteProduction.isError"
      :cancel-route="'/productions'"
      :text="deleteText()"
      :error-text="$t('productions.delete_error')"
      @confirm="confirmDeleteProduction"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionList from './lists/ProductionList.vue'
import EditProductionModal from './modals/EditProductionModal'
import DeleteModal from './widgets/DeleteModal'
import Filters from './widgets/Filters.vue'
import ButtonLink from './widgets/ButtonLink.vue'
import PageTitle from './widgets/PageTitle.vue'

export default {
  name: 'menu',

  components: {
    ButtonLink,
    DeleteModal,
    EditProductionModal,
    Filters,
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
      choices: [],
      productionFilters: [{
        type: 'Status',
        value: {
          name: 'open'
        }
      }],
      productionFilterTypes: [
        'Status'
      ]
    }
  },

  computed: {
    ...mapGetters([
      'productions',
      'isProductionsLoading',
      'isProductionsLoadingError',
      'editProduction',
      'deleteProduction',
      'getProduction'
    ])
  },

  created () {
    this.loadProductions((err) => {
      if (!err) this.handleModalsDisplay()
    })
  },

  methods: {
    ...mapActions([
      'loadProductions'
    ]),

    confirmEditProduction (form) {
      let action = 'newProduction'
      if (this.productionToEdit) {
        action = 'editProduction'
        form.id = this.productionToEdit.id
      }

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          if (!err) {
            this.modals.isNewDisplayed = false
            this.$router.push('/productions')
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
        return this.$t('productions.delete_text', {name: production.name})
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const productionId = this.$store.state.route.params.production_id

      if (path.indexOf('new') > 0) {
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.productionToEdit = this.getProduction(productionId)
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.productionToDelete = this.getProduction(productionId)
        this.modals.isDeleteDisplayed = true
      } else {
        this.modals.isNewDisplayed = false
        this.modals.isDeleteDisplayed = false
      }
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() }
  }
}
</script>

<style scoped>
</style>
