<template>
  <div class="hardware-items page fixed-page">
    <list-page-header
      :title="$t('hardware_items.title')"
      :new-entry-label="$t('hardware_items.new_hardware_item')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

    <hardware-item-list
      class="hardware-item-list"
      :entries="hardwareItemsList"
      :is-loading="loading.list"
      :is-error="errors.list"
      :remaining-hardware-items="remainingHardwareItems"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-hardware-item-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :hardware-item-to-edit="hardwareItemToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditHardwareItem"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('hardware_items.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteHardwareItem"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditHardwareItemModal from '@/components/modals/EditHardwareItemModal.vue'
import HardwareItemList from '@/components/lists/HardwareItemList.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

export default {
  name: 'hardware-items',

  components: {
    DeleteModal,
    EditHardwareItemModal,
    HardwareItemList,
    ListPageHeader,
    RouteTabs
  },

  data() {
    return {
      activeTab: 'active',
      choices: [],
      hardwareItemToDelete: null,
      hardwareItemToEdit: {},
      linkedHardwareItems: {},
      errors: {
        del: false,
        edit: false,
        list: false
      },
      modals: {
        del: false,
        edit: false
      },
      loading: {
        del: false,
        edit: false,
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

  async mounted() {
    this.activeTab = this.$route.query.tab || 'active'
    this.linkedHardwareItems = await this.loadLinkedHardwareItems()
  },

  computed: {
    ...mapGetters(['activePeople', 'hardwareItems', 'archivedHardwareItems']),

    isActiveTab() {
      return this.activeTab === 'active'
    },

    hardwareItemsList() {
      return this.isActiveTab ? this.hardwareItems : this.archivedHardwareItems
    },

    deleteText() {
      const hardwareItem = this.hardwareItemToDelete
      if (hardwareItem) {
        return this.$t('hardware_items.delete_text', {
          name: hardwareItem.name
        })
      } else {
        return ''
      }
    },

    usedAmounts() {
      const usedAmounts = {}
      this.activePeople.forEach(person => {
        person.departments.forEach(departmentId => {
          const departmentItems = this.linkedHardwareItems[departmentId] || []
          departmentItems.forEach(item => {
            if (!usedAmounts[item.id]) {
              usedAmounts[item.id] = 0
            }
            usedAmounts[item.id] += 1
          })
        })
      })
      return usedAmounts
    },

    remainingHardwareItems() {
      const remainingAmounts = {}

      this.hardwareItems.forEach(hardwareItem => {
        remainingAmounts[hardwareItem.id] =
          hardwareItem.inventory_amount -
          (this.usedAmounts[hardwareItem.id] || 0)
      })
      return remainingAmounts
    }
  },

  methods: {
    ...mapActions([
      'deleteHardwareItem',
      'editHardwareItem',
      'newHardwareItem',
      'loadHardwareItems',
      'loadLinkedHardwareItems'
    ]),

    confirmEditHardwareItem(form) {
      let action = 'newHardwareItem'
      if (this.hardwareItemToEdit && this.hardwareItemToEdit.id) {
        action = 'editHardwareItem'
        form.id = this.hardwareItemToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteHardwareItem() {
      this.loading.del = true
      this.errors.del = false
      this.deleteHardwareItem(this.hardwareItemToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('hardware_items.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('hardware_items.fields.name'),
        this.$t('hardware_items.fields.short_name'),
        this.$t('hardware_items.fields.monthly_cost'),
        this.$t('hardware_items.fields.inventory_amount')
      ]
      const entries = [headers].concat(
        this.hardwareItems.map(hardwareItem => [
          hardwareItem.type,
          hardwareItem.name,
          hardwareItem.short_name,
          hardwareItem.monthly_cost,
          hardwareItem.inventory_amount
        ])
      )
      csv.buildCsvFile(name, entries)
    },

    onNewClicked() {
      this.hardwareItemToEdit = {}
      this.errors.edit = false
      this.modals.edit = true
    },

    onEditClicked(hardwareItem) {
      this.hardwareItemToEdit = hardwareItem
      this.errors.edit = false
      this.modals.edit = true
    },

    onDeleteClicked(hardwareItem) {
      this.hardwareItemToDelete = hardwareItem
      this.errors.del = false
      this.modals.del = true
    }
  },

  watch: {
    '$route.query.tab'() {
      this.activeTab = this.$route.query.tab || 'active'
    }
  },

  head() {
    return {
      title: `${this.$t('hardware_items.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.software-license-list {
  margin-top: 0;
}
</style>
