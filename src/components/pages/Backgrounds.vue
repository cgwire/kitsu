<template>
  <div class="backgrounds page fixed-page">
    <list-page-header
      :title="$t('backgrounds.title')"
      :new-entry-label="$t('backgrounds.new_background')"
      :is-exportable="false"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <background-list
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
      :text="deleteText()"
      :error-text="$t('backgrounds.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteBackground"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import BackgroundList from '@/components/lists/BackgroundList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditBackgroundModal from '@/components/modals/EditBackgroundModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

export default {
  name: 'backgrounds',

  components: {
    BackgroundList,
    DeleteModal,
    EditBackgroundModal,
    ListPageHeader,
    RouteTabs
  },

  data() {
    return {
      activeTab: 'active',
      backgroundToEdit: {},
      backgroundToDelete: {},
      modals: {
        edit: false,
        del: false
      },
      loading: {
        edit: false,
        del: false,
        list: false
      },
      errors: {
        edit: false,
        del: false,
        list: false
      },
      tabs: [
        {
          name: 'active',
          label: this.$t('main.active')
        },
        {
          name: 'archived',
          label: this.$t('main.archived')
        }
      ]
    }
  },

  mounted() {
    this.activeTab = this.$route.query.tab || 'active'
  },

  computed: {
    ...mapGetters(['archivedBackgrounds', 'backgrounds']),

    backgroundsList() {
      return this.activeTab === 'active'
        ? this.backgrounds
        : this.archivedBackgrounds
    }
  },

  methods: {
    ...mapActions(['deleteBackground']),

    confirmEditBackground(form) {
      const isNew = !this.backgroundToEdit?.id
      let action = 'newBackground'
      if (!isNew) {
        action = 'saveBackground'
        form.id = this.backgroundToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this.$store
        .dispatch(action, form)
        .then(() => {
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.errors.edit = true
        })
        .finally(() => {
          this.loading.edit = false
        })
    },

    confirmDeleteBackground() {
      this.loading.del = true
      this.errors.del = false
      this.deleteBackground(this.backgroundToDelete)
        .then(() => {
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.errors.del = true
        })
        .finally(() => {
          this.loading.del = false
        })
    },

    deleteText() {
      const background = this.backgroundToDelete
      return background
        ? this.$t('backgrounds.delete_text', { name: background.name })
        : ''
    },

    onNewClicked() {
      this.backgroundToEdit = {}
      this.modals.edit = true
    },

    onEditClicked(background) {
      this.backgroundToEdit = background
      this.modals.edit = true
    },

    onDeleteClicked(background) {
      this.backgroundToDelete = background
      this.modals.del = true
    }
  },

  watch: {
    $route() {
      this.activeTab = this.$route.query.tab || 'active'
    }
  },

  head() {
    return {
      title: `${this.$t('backgrounds.title')} - Kitsu`
    }
  }
}
</script>
