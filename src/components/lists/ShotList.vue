<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="thumbnail"></th>
          <th class="episode" v-if="entries && entries.length > 0 && entries[0].episode_name.length > 0">
            {{ $t('shots.fields.episode') }}
          </th>
          <th class="sequence">{{ $t('shots.fields.sequence') }}</th>
          <th class="name shot-name">{{ $t('shots.fields.name') }}</th>
          <th class="framein">{{ $t('shots.fields.frame_in') }}</th>
          <th class="frameout">{{ $t('shots.fields.frame_out') }}</th>
          <th class="fps">{{ $t('shots.fields.fps') }}</th>
          <th class="description">{{ $t('shots.fields.description') }}</th>
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
                name: 'create-shot-tasks',
                params: {
                  production_id: currentProduction.id
                }
              }"
              v-if="isCurrentUserManager"
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
    <p class="info">{{ $t('shots.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('shots.new_shots')"
      :path="{
        name: 'manage-shots',
        params: {production_id: currentProduction.id}
      }"
    >
    </button-link>
  </div>

  <div
    ref="body"
    class="table-body"
    v-infinite-scroll="loadMoreShots"
    v-scroll="onBodyScroll"
  >
    <table class="table">
      <tbody>
        <tr
          :key="entry.id"
          :class="{canceled: entry.canceled}"
          v-for="entry in entries"
        >
          <td class="thumbnail">
            <entity-thumbnail :entity="entry"></entity-thumbnail>
          </td>
          <td :class="{name: !entry.canceled}" v-if="entries[0].episode_name.length > 0">
            {{ entry.episode_name }}
          </td>
          <td :class="{name: !entry.canceled}">
            {{ entry.sequence_name }}
          </td>
          <td :class="{'shot-name': true, 'name': !entry.canceled}">
            <router-link :to="{
              name: 'shot',
              params: {
                production_id: entry.production_id,
                shot_id: entry.id
              }
            }">
              {{ entry.name }}
            </router-link>
          </td>
          <td class="framein">
            {{ entry.data && entry.data.frame_in ? entry.data.frame_in : ''}}
          </td>
          <td class="frameout">
            {{ entry.data && entry.data.frame_out ? entry.data.frame_out : ''}}
          </td>
          <td class="fps">
            {{ entry.data && entry.data.fps ? entry.data.fps : ''}}
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
              name: 'edit-shots',
              params: {
                shot_id: entry.id,
                production_id: currentProduction.id
              }
            }"
            :restore-route="{
              name: 'restore-shots',
              params: {
                shot_id: entry.id,
                production_id: currentProduction.id
              }
            }"
            :delete-route="{
              name: 'delete-shots',
              params: {
                shot_id: entry.id,
                production_id: currentProduction.id
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

  <p class="has-text-centered nb-shots" v-if="!isEmptyList">
    {{ displayedShotsLength }} {{ $tc('shots.number', displayedShotsLength) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ValidationCell from '../cells/ValidationCell'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'
import EntityThumbnail from '../widgets/EntityThumbnail'

export default {
  name: 'shot-list',
  props: [
    'entries',
    'isLoading',
    'isError',
    'validationColumns'
  ],
  data () {
    return {
      busy: false
    }
  },
  components: {
    ButtonLink,
    ButtonHrefLink,
    EntityThumbnail,
    PageTitle,
    RowActions,
    TableInfo,
    ValidationCell
  },
  computed: {
    ...mapGetters([
      'currentProduction',
      'isCurrentUserManager',
      'displayedShotsLength',
      'shotSearchText'
    ]),
    isEmptyList () {
      return this.entries &&
             this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.shotSearchText || this.shotSearchText.length === 0)
    }
  },

  methods: {
    ...mapActions([
      'displayMoreShots'
    ]),

    onHeaderScroll (event, position) {
      this.$refs.tableWrapper.scrollLeft = position.scrollLeft
    },

    onTaskSelected (task) {
      this.$store.commit('ADD_SELECTED_TASK', task)
    },

    onTaskUnselected (task) {
      this.$store.commit('REMOVE_SELECTED_TASK', task)
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
    },

    loadMoreShots () {
      this.displayMoreShots()
    },

    setScrollPosition (scrollPosition) {
      this.$refs.body.scrollTop = scrollPosition
    }
  }
}
</script>

<style scoped>
.project {
  min-width: 60px;
  max-width: 60px;
  width: 60px;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}

.name {
  min-width: 100px;
  width: 100px;
  font-weight: bold;
}

.name a {
  color: inherit;
}

.name.shot-name {
  min-width: 110px;
  width: 110px;
}

.episode {
  min-width: 100px;
  max-width: 100px;
  width: 100px;
}

.sequence {
  min-width: 100px;
  max-width: 100px;
  width: 100px;
  font-weight: bold;
}

.framein {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.frameout {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.fps {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
  margin-right: 1em;
}

td.name {
  font-size: 1.2em;
}

td.sequence {
  font-size: 1.2em;
}

.canceled {
  text-decoration: line-through;
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
