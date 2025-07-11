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
      :entries="studioList"
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

<script>
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditStudiosModal from '@/components/modals/EditStudiosModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import StudioList from '@/components/lists/StudioList.vue'

export default {
  name: 'studios',

  components: {
    DeleteModal,
    EditStudiosModal,
    ListPageHeader,
    RouteTabs,
    StudioList
  },

  data() {
    return {
      activeTab: 'active',
      studioToEdit: null,
      studioToDelete: null,
      errors: {
        studios: false,
        edit: false,
        del: false
      },
      loading: {
        studios: false,
        edit: false,
        del: false
      },
      modals: {
        del: false,
        edit: false
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

  async mounted() {
    this.activeTab = this.$route.query.tab || 'active'
    this.loading.studios = true
    this.errors.studios = false
    try {
      await this.loadStudios()
    } catch (error) {
      console.error(error)
      this.errors.studios = true
    }
    this.loading.studios = false
  },

  computed: {
    ...mapGetters(['studios', 'archivedStudios']),

    isActiveTab() {
      return this.activeTab === 'active'
    },

    studioList() {
      return this.isActiveTab ? this.studios : this.archivedStudios
    },

    deleteText() {
      return this.studioToDelete
        ? this.$t('studios.delete_text', { name: this.studioToDelete.name })
        : ''
    }
  },

  methods: {
    ...mapActions(['deleteStudio', 'editStudio', 'loadStudios', 'newStudio']),

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('studios.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('studios.fields.name'),
        this.$t('studios.fields.color')
      ]
      const entries = [headers].concat(
        this.studios.map(studio => [studio.type, studio.name, studio.color])
      )
      csv.buildCsvFile(name, entries)
    },

    onNewClicked() {
      this.studioToEdit = { name: '', color: '#999999' }
      this.modals.edit = true
    },

    onEditClicked(studio) {
      this.studioToEdit = studio
      this.modals.edit = true
    },

    async confirmEditStudio(form) {
      this.loading.edit = true
      this.errors.edit = false
      form.id = this.studioToEdit?.id
      try {
        if (form.id) {
          await this.editStudio(form)
        } else {
          await this.newStudio(form)
        }
        this.modals.edit = false
      } catch (error) {
        console.error(error)
        this.errors.edit = true
      }
      this.loading.edit = false
    },

    onDeleteClicked(studio) {
      this.studioToDelete = studio
      this.modals.del = true
    },

    async confirmDeleteStudio() {
      this.loading.del = true
      this.errors.del = false
      try {
        await this.deleteStudio(this.studioToDelete)
        this.modals.del = false
      } catch (error) {
        console.error(error)
        this.errors.del = true
      }
      this.loading.del = false
    }
  },

  watch: {
    '$route.query.tab'() {
      this.activeTab = this.$route.query.tab || 'active'
    }
  },

  head() {
    return {
      title: `${this.$t('studios.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.studio-list {
  margin-top: 0;
}
</style>
