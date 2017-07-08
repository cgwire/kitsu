<template>
  <div class="assets page">
    <div class="assets-list">
      <h1 class="title">{{ $t('assets.title') }}</h1>

      <div class="level">
        <div class="level-left">
        </div>
        <div class="level-right">
          <div class="level-item">
            <button-link
              class="level-item"
              :text="$t('assets.new_asset')"
              path="/assets/new"
            >
            </button-link>
          </div>
        </div>
      </div>

      <asset-list
        :entries="assets"
        :is-loading="isAssetsLoading"
        :is-error="isAssetsLoadingError"
      ></asset-list>
    </div>

    <edit-asset-modal
      :active="modals.isNewDisplayed"
      :is-loading="editAsset.isLoading"
      :is-error="editAsset.isError"
      :cancel-route="'/assets'"
      :asset-to-edit="assetToEdit"
      @confirm="confirmEditAsset"
    >
    </edit-asset-modal>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteAsset.isLoading"
      :is-error="deleteAsset.isError"
      :cancel-route="'/assets'"
      :text="deleteText()"
      :error-text="$t('assets.delete_error')"
      @confirm="confirmDeleteAsset"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AssetList from './lists/AssetList.vue'
import EditAssetModal from './modals/EditAssetModal'
import DeleteModal from './widgets/DeleteModal'
import Filters from './widgets/Filters.vue'
import ButtonLink from './widgets/ButtonLink.vue'

export default {
  name: 'menu',

  components: {
    AssetList,
    DeleteModal,
    EditAssetModal,
    Filters,
    ButtonLink
  },

  data () {
    return {
      modals: {
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      assetToDelete: null,
      assetToEdit: null,
      choices: [],
      assetFilters: [{
        type: 'Type',
        value: {
          name: 'open'
        }
      }],
      assetFilterTypes: [
        'Type'
      ]
    }
  },

  computed: {
    ...mapGetters([
      'assets',
      'isAssetsLoading',
      'isAssetsLoadingError',
      'editAsset',
      'deleteAsset',
      'getAsset'
    ])
  },

  created () {
    this.loadAssets((err) => {
      if (!err) this.handleModalsDisplay()
    })
  },

  methods: {
    ...mapActions([
      'loadAssets'
    ]),

    confirmEditAsset (form) {
      let action = 'newAsset'
      if (this.assetToEdit) {
        action = 'editAsset'
        form.id = this.assetToEdit.id
      }

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          if (!err) {
            this.modals.isNewDisplayed = false
            this.$router.push('/assets')
          }
        }
      })
    },

    confirmDeleteAsset () {
      this.$store.dispatch('deleteAsset', {
        asset: this.assetToDelete,
        callback: (err) => {
          if (!err) this.modals.isDeleteDisplayed = false
        }
      })
    },

    deleteText () {
      const asset = this.assetToDelete
      if (asset) {
        return this.$t('assets.delete_text', {name: asset.name})
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const assetId = this.$store.state.route.params.asset_id

      if (path.indexOf('new') > 0) {
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.assetToEdit = this.getAsset(assetId)
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.assetToDelete = this.getAsset(assetId)
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
.assets-list {
  margin-top: 2em;
}
</style>
