<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="thumbnail"></th>
          <th class="type">{{ $t('assets.fields.type') }}</th>
          <th class="name">{{ $t('assets.fields.name') }}</th>
          <th class="description">{{ $t('assets.fields.description') }}</th>
          <th
            class="validation"
            :style="{
              'border-left': '2px solid ' + column.color
            }"
            v-for="column in validationColumns">
            {{ column.name }}
          </th>

          <th class="actions">
            <button-link
              class="is-small"
              icon="plus"
              :text="$t('tasks.create_tasks')"
              :path="{
                name: 'create-asset-tasks',
                params: {
                  production_id: currentProduction.id
                }
              }"
              v-if="isCurrentUserManager && entries.length > 0"
            >
            </button-link>
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <div class="has-text-centered" v-if="isEmptyList">
    <p class="info">{{ $t('assets.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('assets.new_assets')"
      :path="{
        name: 'new-asset',
        params: {production_id: currentProduction.id}
      }"
    >
    </button-link>
  </div>

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table">
      <tbody>
        <tr
          :key="entry.id"
          :class="{canceled: entry.canceled}"
          v-for="entry in entries"
        >
          <td class="thumbnail">
            <img
              class="thumbnail-picture"
              v-lazy="'/api/pictures/thumbnails/preview-files/' + entry.preview_file_id + '.png'"
              v-if="entry.preview_file_id && entry.preview_file_id.length > 0"
            />
            <span class="thumbnail-picture thumbnail-empty" v-else>
            </span>
          </td>
          <td :class="{type: !entry.canceled}">
            {{ entry.asset_type_name }}
          </td>
          <td :class="{name: !entry.canceled}">
            {{ entry.name }}
          </td>
          <td class="description">
            {{ entry.description }}
          </td>
          <validation-cell
            :key="column.name + '-' + entry.id"
            :column="column"
            :entity="entry"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="column in validationColumns"
          >
          </validation-cell>
          <row-actions v-if="isCurrentUserManager"
            :entry="entry"
            :edit-route="{
              name: 'edit-asset',
              params: {
                production_id: currentProduction.id,
                asset_id: entry.id
              }
            }"
            :delete-route="{
              name: 'delete-asset',
              params: {
                production_id: currentProduction.id,
                asset_id: entry.id
              }
            }"
            :restore-route="{
              name: 'restore-asset',
              params: {
                production_id: currentProduction.id,
                asset_id: entry.id
              }
            }"
          >
          </row-actions>
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered nb-assets" v-if="!isEmptyList">
    {{ displayedAssetsLength }} {{ $tc('assets.number', displayedAssetsLength) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'
import ValidationCell from '../cells/ValidationCell'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'asset-list',
  props: [
    'entries',
    'isLoading',
    'isError',
    'validationColumns'
  ],
  data () {
    return {}
  },
  components: {
    ButtonLink,
    ButtonHrefLink,
    RowActions,
    PageTitle,
    TableInfo,
    ValidationCell
  },
  computed: {
    ...mapGetters([
      'currentProduction',
      'assetSearchText',
      'selectedTasks',
      'isCurrentUserManager',
      'displayedAssetsLength'
    ]),
    isEmptyList () {
      return this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.assetSearchText || this.assetSearchText.length === 0)
    }
  },
  methods: {
    ...mapActions([
    ]),
    onTaskSelected (validationInfo) {
      this.$store.commit('ADD_SELECTED_TASK', validationInfo)
    },
    onTaskUnselected (validationInfo) {
      this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
    },
    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style scoped>
.table {
  min-width: 1000px;
}

.actions {
  min-width: 150px;
  padding: 0.4em;
}

.name {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
  font-weight: bold;
}

.type {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  font-weight: bold;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  margin-right: 1em;
}

td.name {
  font-size: 1.2em;
}

td.type {
  font-size: 1.2em;
}

.thumbnail {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
  padding: 0;
}

.thumbnail img {
  margin-top: 5px;
}

span.thumbnail-empty {
  display: block;
  width: 50px;
  height: 30px;
  background: #F3F3F3;
}

.info {
  margin-top: 2em;
}
</style>
