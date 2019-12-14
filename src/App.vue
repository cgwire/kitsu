<template>
  <div :class="{ theme: true, dark: isDarkTheme }">
    <div
      class="has-text-centered mt2 loading-info"
      v-if="user && isDataLoading"
    >
        <span>{{ $t('main.loading_data') }}...</span>
      <spinner class="mt2" />
    </div>
    <router-view v-else />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Spinner from './components/widgets/Spinner.vue'

export default {
  name: 'app',

  components: {
    Spinner
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetTypeMap',
      'currentProduction',
      'episodeMap',
      'isCurrentUserAdmin',
      'isDataLoading',
      'isDarkTheme',
      'isLoginLoading',
      'isSavingCommentPreview',
      'route',
      'personMap',
      'productionMap',
      'sequenceMap',
      'shotMap',
      'taskMap',
      'taskStatusMap',
      'taskTypeMap',
      'user'
    ])
  },

  mounted () {
    if (localStorage.getItem('dark-theme') === 'true' && !this.isDarkTheme) {
      this.$store.commit('TOGGLE_DARK_THEME')
      document.documentElement.style.background = '#36393F'
      document.body.style.background = '#36393F'
    } else {
      document.documentElement.style.background = '#FFF'
      document.body.style.background = '#FFF'
    }
  },

  metaInfo: {
    link: [
      {
        rel: 'icon',
        href: '/static/favicon.ico'
      }
    ]
  },

  methods: {
    ...mapActions([
      'getOrganisation',
      'getTask',
      'loadAsset',
      'loadAssetType',
      'loadComment',
      'loadEpisode',
      'loadOpenProductions',
      'loadPerson',
      'loadPersonTasks',
      'loadProduction',
      'loadSequence',
      'loadShot',
      'loadTaskStatus',
      'loadTaskType',
      'refreshPreview',
      'refreshMetadataDescriptor',
      'removeAsset'
    ]),

    onAssignation (eventData, assign = true) {
      const personId = eventData.person_id
      const selectedTaskIds = [eventData.task_id]

      // for entity lists
      if (assign) {
        this.$store.commit('ASSIGN_TASKS', { selectedTaskIds, personId })
      } else {
        this.$store.commit('UNASSIGN_TASKS', selectedTaskIds)
      }

      // for todo lists
      if (this.route.path.indexOf(eventData.person_id) > 0) {
        this.loadPersonTasks({
          personId: eventData.person_id,
          forced: true
        })
      }
    }
  },

  watch: {
    isDarkTheme () {
      if (this.isDarkTheme) {
        document.documentElement.style.background = '#36393F'
        document.body.style.background = '#36393F'
      } else {
        document.documentElement.style.background = '#FFF'
        document.body.style.background = '#FFF'
      }
    }
  },

  socket: {
    events: {
      'project:new' (eventData) {
        if (!this.productionMap[eventData.project_id]) {
          this.loadProduction(eventData.project_id)
        }
      },

      'project:update' (eventData) {
        if (this.productionMap[eventData.project_id]) {
          this.loadProduction(eventData.project_id)
        } else {
          this.loadOpenProductions()
        }
      },

      'project:delete' (eventData) {
        if (this.productionMap[eventData.project_id]) {
          this.$store.commit('REMOVE_PRODUCTION', { id: eventData.project_id })
        }
      },

      'sequence:new' (eventData) {
        if (
          !this.sequenceMap[eventData.sequence_id] &&
          this.currentProduction &&
          this.currentProduction.id === eventData.project_id
        ) {
          this.loadSequence(eventData.sequence_id)
        }
      },

      'sequence:update' (eventData) {
        if (this.sequenceMap[eventData.sequence_id]) {
          this.loadSequence(eventData.sequence_id)
        }
      },

      'sequence:delete' (eventData) {
        if (this.sequenceMap[eventData.sequence_id]) {
          this.$store.commit('REMOVE_SEQUENCE', { id: eventData.sequence_id })
        }
      },

      'episode:new' (eventData) {
        if (
          !this.episodeMap[eventData.episode_id] &&
          this.currentProduction &&
          this.currentProduction.id === eventData.project_id
        ) {
          this.loadEpisode(eventData.episode_id)
        }
      },

      'episode:update' (eventData) {
        if (this.episodeMap[eventData.episode_id]) {
          this.loadEpisode(eventData.episode_id)
        }
      },

      'episode:delete' (eventData) {
        if (this.episodeMap[eventData.episode_id]) {
          this.$store.commit('REMOVE_EPISODE', { id: eventData.episode_id })
        }
      },

      'shot:new' (eventData) {
        if (
          !this.shotMap[eventData.shot_id] &&
          this.currentProduction &&
          this.currentProduction.id === eventData.project_id
        ) {
          setTimeout(() => {
            this.loadShot(eventData.shot_id)
          }, 1000)
        }
      },

      'shot:update' (eventData) {
        if (this.shotMap[eventData.shot_id]) {
          this.loadShot(eventData.shot_id)
        }
      },

      'shot:delete' (eventData) {
        if (this.shotMap[eventData.shot_id]) {
          this.$store.commit('REMOVE_SHOT', { id: eventData.shot_id })
        }
      },

      'asset:new' (eventData) {
        if (
          !this.assetMap[eventData.asset_id] &&
          this.currentProduction &&
          this.currentProduction.id === eventData.project_id
        ) {
          setTimeout(() => {
            this.loadAsset(eventData.asset_id)
          }, 1000)
        }
      },

      'asset:update' (eventData) {
        if (this.assetMap[eventData.asset_id]) {
          this.loadAsset(eventData.asset_id)
        }
      },

      'asset:delete' (eventData) {
        if (this.assetMap[eventData.asset_id]) {
          this.$store.commit('REMOVE_ASSET', { id: eventData.asset_id })
        }
      },

      'task-type:new' (eventData) {
        if (!this.taskTypeMap[eventData.task_type_id]) {
          this.loadTaskType(eventData.task_type_id)
        }
      },

      'task-type:update' (eventData) {
        if (this.taskTypeMap[eventData.task_type_id]) {
          this.loadTaskType(eventData.task_type_id)
        }
      },

      'task-type:delete' (eventData) {
        if (this.taskTypeMap[eventData.task_type_id]) {
          this.$store.commit(
            'DELETE_TASK_TYPE_END',
            { id: eventData.task_type_id }
          )
        }
      },

      'task-status:new' (eventData) {
        if (!this.taskStatusMap[eventData.task_status_id]) {
          this.loadTaskStatus(eventData.task_status_id)
        }
      },

      'task-status:update' (eventData) {
        if (this.taskStatusMap[eventData.task_status_id]) {
          this.loadTaskStatus(eventData.task_status_id)
        }
      },

      'task-status:delete' (eventData) {
        if (this.taskStatusMap[eventData.task_status_id]) {
          this.$store.commit(
            'DELETE_TASK_STATUS_END',
            { id: eventData.task_status_id }
          )
        }
      },

      'asset-type:new' (eventData) {
        if (!this.assetTypeMap[eventData.asset_type_id]) {
          this.loadAssetType(eventData.asset_type_id)
        }
      },

      'asset-type:update' (eventData) {
        if (this.assetTypeMap[eventData.asset_type_id]) {
          this.loadAssetType(eventData.asset_type_id)
        }
      },

      'asset-type:delete' (eventData) {
        if (this.assetTypeMap[eventData.asset_type_id]) {
          this.$store.commit(
            'DELETE_ASSET_TYPE_END',
            { id: eventData.asset_type_id }
          )
        }
      },

      'person:new' (eventData) {
        if (!this.personMap[eventData.person_id]) {
          this.loadPerson(eventData.person_id)
        }
      },

      'person:update' (eventData) {
        if (this.personMap[eventData.person_id]) {
          this.loadPerson(eventData.person_id)
        }
      },

      'person:delete' (eventData) {
        const person = this.personMap[eventData.person_id]
        if (person) {
          this.$store.commit('DELETE_PEOPLE_START', person)
          this.$store.commit('DELETE_PEOPLE_END', person)
        }
      },

      'task:assign' (eventData) {
        this.onAssignation(eventData)
      },

      'task:unassign' (eventData) {
        this.onAssignation(eventData, false)
      },

      'comment:new' (eventData) {
        const commentId = eventData.comment_id
        if (!this.isSavingCommentPreview) this.loadComment({ commentId })
      },

      'task:update' (eventData) {
        if (this.taskMap[eventData.task_id]) {
          this.getTask({ taskId: eventData.task_id })
        }
      },

      'metadata-descriptor:new' (eventData) {
        this.refreshMetadataDescriptor(eventData.metadata_descriptor_id)
      },

      'metadata-descriptor:update' (eventData) {
        this.refreshMetadataDescriptor(eventData.metadata_descriptor_id)
      },

      'metadata-descriptor:delete' (eventData) {
        this.$store.commit('DELETE_METADATA_DESCRIPTOR_END', {
          id: eventData.metadata_descriptor_id
        })
      },

      'organisation:update' (eventData) {
        if (this.isCurrentUserAdmin) {
          this.getOrganisation()
        }
      }
    }
  }
}
</script>

<style lang="scss">
:focus {outline:none;}
::-moz-focus-inner {border:0;}

html {
  height: 100%;
  overflow-y: auto;
}

body {
  height: 100%;
  min-height: 100%;
  width: 100%;
  background: #EEE;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0;
}

.dark {
  .hero {
    background-color: $dark-grey;
  }

  .input,
  select,
  textarea,
  .page,
  .loading-info,
  .side-column {
    background: #36393F;
    color: $white-grey;
  }

  textarea.input:focus {
    border-color: $green;
  }

  strong {
    color: white;
  }

  code {
    background: $dark-grey;
    border-color: black;
    color: $white-grey;
  }

  textarea[disabled] {
    background: #36393F;
    color: #BBB;
    border-color: #25282E;
  }

  select,
  textarea,
  .input {
    border-color: #25282E;
  }

  .select::after {
    border-color: #00B242;
  }

  .is-top select {
    background-color: #222427;
  }

  .title,
  .subtitle {
    color: $white-grey;
  }

   label.label {
    color: $white-grey;
  }

  .box .title,
  .box {
    background: #3D4048;
    color: $white-grey;
  }

  .button.is-link {
    background: transparent;
    border-color: transparent;
    color: #DDDDDD;
  }

  .is-link:hover {
    color: #DDDDDD;
    background: #5E6169;
  }

  .button {
    background: #4E5159;
    border-color: #25282E;
    color: $white-grey;
  }

  .button.is-danger {
    background: #FF2B56;
  }

  .main-button {
    background: #00B242;
  }

  .add-comment .select select {
    background: #4E5159;
  }

  .hero .box h1.title {
    color: #DDD;
  }

  .table-header tr:hover {
    background: transparent;
  }

  .table-header,
  .table-body .table tr:nth-child(odd) {
    color: $white-grey;
    background: #36393F;
  }

  .table-body .table tr:nth-child(even) {
    color: $white-grey;
    background: #46494F;
  }

  .table-header th {
    color: $white-grey;
    border-color: #666666;
  }

  .table-body td {
    border-color: #25282E;
  }

  .table-body .table tr:hover {
    color: $white-grey;
    background: #5E6169;
  }

  .table tr.type-header {
    border: 1px solid #36393F;
    font-size: 1.1em;
  }

  .table tr.type-header:hover {
    background: #36393F;
  }

  .table tr.type-header td {
    font-weight: bold;
    padding-left: 0.3em;
  }

  .splitted-table {
    border-left: 1px solid #36393F;

    tr {
      border-right: 1px solid #25282E;
      border-left: 1px solid #25282E;
    }

    thead tr {
      border-right: 1px solid transparent;
      border-left: 1px solid transparent;
    }

    thead tr a {
      color: #7A7A7A;
    }

    .table-body {
      padding-top: 1em;
      position: relative;
      z-index: 1;
    }

    tbody {
      border-bottom: 1px solid #25282E;
    }

    tbody tr:first-child {
      border-top: 0;
      background: transparent;
    }

    .empty-line {
      border: 0;
    }

    .empty-line td {
      border-color: #36393F;
      background: #36393F;
      border: 0;
    }
  }

  .search-input {
    border-color: #888;
  }

  .erase-search .tag {
    background-color: #999;
    color: #333
  }

  .erase-search .tag:hover {
    background-color: #CCC;
  }

  .tabs a {
    color: $white-grey;
  }

  .tabs a:hover {
    border-color: $white-grey;
  }

  .tabs li.is-active a:hover {
    border-color: #00C252;
    color: #00C252;
  }

  .tabs li.is-active a:hover {
    border-color: #00C252;
    color: #00C252;
  }

  .search-queries .tag {
    color: #EEE;
    background-color: #5E6169;
  }

  .project-dates .vdp-datepicker__calendar,
  .current-date .datepicker .vdp-datepicker__calendar {
    background-color: #36393F;
    border-color: #25282E;
    z-index: 150;
  }
  .project-dates .datepicker .vdp-datepicker__calendar .prev,
  .project-dates .datepicker .vdp-datepicker__calendar .next,
  .project-dates .datepicker .vdp-datepicker__calendar .day__month_btn,
  .current-date .datepicker .vdp-datepicker__calendar header span:hover {
    background: #36393F;
  }
  .project-dates .datepicker .vdp-datepicker__calendar header .prev::after,
  .current-date .datepicker .vdp-datepicker__calendar header .prev::after {
    border-right-color: #EEE;
  }
  .project-dates .datepicker .vdp-datepicker__calendar header .next::after,
  .current-date .datepicker .vdp-datepicker__calendar header .next::after {
    border-left-color: #EEE;
  }

  .projects-dates .datepicker .vdp-datepicker__calendar header .next.disabled::after,
  .current-date .datepicker .vdp-datepicker__calendar header .next.disabled::after {
    border-left-color: #666;
  }

  .hero .control .icon {
    color: #555;
  }

  .v-autocomplete-input {
    background: $dark-grey;
    color: white;
  }
} // End dark theme

#app .router-link-active {
  color: #00d1b2;
}

.loading-info {
  background: white;
}

.hidden {
  display: none !important;
}

.page {
  padding: 0.5em 2em;
  padding-top: 70px;
  background: white;
  height: 100vh;
}

th.actions {
  min-width: 120px;
}

td.actions {
  min-width: 160px;
}

ul {
  list-style-type: disc;
  margin-left: 1em;
}

.hero {
  background-color: #F3F3F3;
}

.avatar {
  border-radius: 50%;
  color: white;
}

.avatar img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 0px;
}

.mention,
.mention:hover {
  color: $blue;
}

.th-project {
  width: 30px;
  border-radius: 50%;
}

.grey-background {
  background-color: #CFCFCF;
}

td strong {
  font-size: 1.2em;
}

tr .actions p {
  margin-bottom: 0;
}

tr .actions button,
tr td.actions a {
  opacity: 0;
  color: #999;
}

tr th.actions a {
  color: #999;
}

tr:hover .actions button,
tr:hover .actions a {
  opacity: 1
}

a {
  color: #999;
}

a:hover {
  color: #999;
}

.info {
  margin-top: 1em;
  font-size: 1.4em;
}

.canceled td:not(.actions) {
  text-decoration: line-through;
}

.field {
  margin-bottom: 2em;
}

.ml05 {
  margin-left: 0.5em;
}

.ml1 {
  margin-left: 1em;
}

.mr05 {
  margin-right: 0.5em;
}

.mr1 {
  margin-right: 1em;
}

.mt1 {
  margin-top: 1em;
}

.mt2 {
  margin-top: 2em;
}

.ml1 {
  margin-left: 1em;
}

.mr1 {
  margin-right: 1em;
}

.mb0 {
  margin-bottom: 0;
}

.filler {
  flex: 1;
}

 label.label {
  color: $grey;
  text-transform: uppercase;
  font-size: 0.8em;
  margin-left: 2px;
}

span.select {
}

texarea,
input.input {
  padding: 1em;
  height: 3em;
}

.select select:hover,
.select select:active,
.select select:focus,
input.input:focus {
  border-color: #00B242;
  outline: none;
}

.button,
.button.is-small {
  border-radius: 2em;
}

.button:focus {
  box-shadow: none;
}

textarea.input:focus {
  border-color: $green;
}

.button.is-primary {
  border-radius: 2px;
  background: #00B242;
}

.button.is-primary:hover {
  background: #67BE4B;
}

.big-button {
  border-radius: 2em;
  font-weight: bold;
  background: #00B242;
  border-color: #00B242;
  color: white;
  font-size: 1.3em;
  max-width: 280px;
  margin: 1em auto;
}

.big-button:hover {
  color: white;
  background: #67BE4B;
}

.error {
  color: #FF1F4B;
}

.success {
  color: #00B242;
}

.strong {
  font-weight: bold;
}

.pull-right {
  float: right;
}

.footer-info {
  font-style: italic;
}

.container {
  max-width: 400px;
  color: #4a4a4a;
}

.main-button {
  border-radius: 5px;
  min-height: 2.6em;
  color: white;
  border-color: #5e60ba;
  padding: 12px 12px 12px 12px;
  margin: .3em 0 0em 0;
  font-size: 1.4em;
  font-weight: 500;
  letter-spacing: 1px;
  background: #00B242;
  color: #fff;
  border: 0;
  transition: all 0.15s ease;
  width: 100%;
  display: block;
  text-align: center;
}

.main-button:hover {
  background: #67BE4B;
  color: #fff;
}

.main-button:focus { outline: 0; }

.modal-content {
  .box {
    border-radius: 1em;
    padding: 1.5em 1.5em 1.5em 1.5em;

    h1.title {
      font-weight: 300;
      font-size: 2em;
      border: 0;
    }

    .button {
      border-radius: 2em;
    }
  }
}

.hero .box {
  margin-top: 30%;
  padding: 3em 2em 2em 2em;
  border-radius: 2px;
  box-shadow: rgba(0,0,0,0.14902) 0px 1px 1px 0px,rgba(0,0,0,0.09804) 0px 1px 2px 0px;
}

.box h1.title {
  color: #6a6a6a;
  font-weight: 500;
  font-size: 1.4em;
  line-height: 1.6em;
}

.hero .box .field {
  margin-bottom: 1em;
}

.hero .box .input {
  height: 2.4em;
}

.hero .box .input:focus {
  border: 1px solid #00B242;
}

.button .icon.is-small:first-child:last-child {
  margin-right: 0em;
}

.actions .button .icon.is-small.icon-only:first-child:last-child {
  margin-right: 0em;
}

.actions .button .icon.is-small:first-child:last-child {
  margin-right: 0em;
}

.button.highlighted {
  background: #00B242;
  color: white;
}

.search-input {
  border: 0;
  box-shadow: none;
  border-radius: 0;
}

.filters-area {}

.query-list {
  margin-bottom: 2em;
  margin-left: 1em;
}

.query-list .tag {
  margin-right: 1em;
  margin-bottom: 0.2em;
  border: 1px solid transparent;
}

.query-list .tag .delete {
  margin-left: 0.5em;
  transform: rotate(45deg) scale(0.7)
}

.query-list .tag:hover {
  transform: scale(1.1)
}

.fixed-page {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding-top: 60px;

  min-height: 0;
}

.page-header,
.page-header.level {
  margin-top: 2em;
  margin-bottom: 0;
}

.data-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 2em;
}

.table td {
  vertical-align: middle;
}

.table td.metadata-descriptor {
  word-wrap: anywhere;
}

.table-header-wrapper {
  overflow: hidden;
}

.table-header {
  display: block;
  width: 100%;
  margin-bottom: 0;
  flex-wrap: wrap;
  position: relative;

  thead th {
    border-width: 0 0 1px;
      font-size: 0.9em;

    &.metadata-descriptor,
    &.validation-cell {
      .descriptor-name,
      .validation-name {
        flex: 1;
      }
    }
  }

  th.actions {
    width: 100%;
  }

  th:hover .header-icon {
    opacity: 100;
  }

  .header-icon {
    width: 15px;
    cursor: pointer;
    opacity: 0;
  }
}

.table-body {
  flex: 1;
  overflow: auto;
  min-height: 1px;
}

.table {
  margin-bottom: 0;
}

.table-info {
  margin-top: 1em;
}

.table-body .table tr:nth-child(even) {
  background: #F6F6F6;
}

.table-body .table tr:hover {
  background: $light-green-lightest;
}

.table tr.type-header {
  border: 1px solid transparent;
  font-size: 1.1em;
}

.table tr.type-header:hover {
  background: transparent;
}

.table tr.type-header td {
  font-weight: bold;
  padding-left: 0.3em;
}

.splitted-table tbody tr {
  border-right: 1px solid #CCC;
  border-left: 1px solid #CCC;
}

.splitted-table thead tr {
  border-right: 1px solid transparent;
  border-left: 1px solid transparent;
}

.splitted-table thead tr a {
  color: #7A7A7A;
}

.splitted-table .table-body {
  padding-top: 1em;
  position: relative;
  z-index: 1;
}

.splitted-table tbody tr:first-child {
  color: #999;
  text-transform: uppercase;
}

.splitted-table tbody:last-child .empty-line:last-child {
  border: 0;
}

.splitted-table tbody {
  border-bottom: 1px solid #CCC;
}

.splitted-table {
  margin-top: 1em;
}

.table-body {
  position: relative;
  z-index: 1;
}

tbody:last-child .empty-line:last-child {
  border: 0;
}

.table-body .table .empty-line {
  background: inherit;
}

.table-header-wrapper {
  position: relative;
}

.table th {
  vertical-align: middle;
}

.header-icon {
  min-width: 15px;
}

.flexrow {
  display: flex;
  align-items: center;
}

.flexrow-item {
  margin-right: 1em;

  &.no-margin {
    margin-right: 0;
  }
}

.flexcolumn {
  display: flex;
  flex-direction: column;
}

.flexcolumn-item {
  width: 100%
}

.flexrow-item:last-child {
  margin-right: 0;
}

.side {
  padding: 1em;
}

.menu-mask {
  position: fixed;
  background: blue;
  z-index: 100;
  top: 0;
  left: 0;
  opacity: 0;
  overflow: hidden;
  background-color: #000;
  width: 100%;
  height: 100%;
}

.button:focus,
.button:active {
  border-color: #666;
}

.thumbnail-picture {
  border: 1px solid #CCC;
}

.modal-content .button {
  margin-left: 0.5em;
}

.modal-content .box p.text {
  margin-bottom: 1em;
}

.modal-content p.is-danger {
  color: #ff3860;
  font-style: italic;
  margin-bottom: 2em;
}

.unselectable {
  user-select: none;
}

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  border-right: 3px solid #CCC;
}

.playlist-column .video-player-box .video-js {
  margin: auto;
}

.tabs li.is-active a {
  border-color: #00B242;
  color: #00B242;
}

.page .columns:last-child {
  margin-bottom: 1em;
}

.side-column {
  width: 400px;
  max-width: 400px;
  margin-top: 70px;
  background: white;
  margin-right: 10px;
  margin-bottom: 10px;
}

.empty-list {
  margin-top: 2em;
  font-size: 1.5em;
}

.tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip .tooltip-inner {
  background: white;
  color: #333;
  border-radius: 16px;
  padding: 1em;
  max-width: 250px;
  box-shadow: 0px 2px 3px 2px rgba(0, 0, 0, 0.1)
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: white;
  z-index: 1;
}

.tooltip[x-placement^="top"] {
  margin-bottom: 5px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
  margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="left"] {
  margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip.popover .popover-inner {
  background: #f9f9f9;
  color: black;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(black, .1);
}

.tooltip.popover .popover-arrow {
  border-color: #f9f9f9;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}

.datepicker .date-field {
  width: 250px;
}

.project-dates .date-input {
  width: 150px;
}

.dark .button.is-on {
  box-shadow: inset 0 0 10px #111;
  border-color: #25282E;
}

.button.is-toggle {
  transition: box-shadow ease 0.3s
}

.button.is-toggle:active,
.button.is-toggle:focus {
  border-color: #dbdbdb;
}

.dark .button.is-toggle:active,
.dark .button.is-toggle:focus {
  border-color: #25282E;
}

.break-word {
  overflow-wrap: break-word;
  hyphens: auto;
  word-wrap: anywhere;
}

.button.is-on {
  box-shadow: inset 0 0 4px #999;
}

.break-word {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.status-combo {
  padding: 0.3em;
  border-radius: 3px;

  .selected-status-line,
  .status-line {
    padding: 0.4em;
  }
}

.status-combo-wrapper {
  margin: 0;

  .status-combo {
    border-top-left-radius: 2em;
    border-bottom-left-radius: 2em;
  }

  .selected-status-line {
    padding: 0.1em;
    padding-left: 0.2em;
  }
}

.project-dates .vdp-datepicker__calendar .cell.day.selected,
.current-date .datepicker .vdp-datepicker__calendar .cell.day.selected {
  background: $purple;
}
.project-dates .vdp-datepicker__calendar .cell.day:not(.blank):not(.disabled):hover,
.current-date .datepicker .vdp-datepicker__calendar .cell.day:not(.blank):not(.disabled):hover {
  border: 1px solid $light-green;
}
.project-dates .vdp-datepicker__calendar .cell.day.disabled:hover,
.current-date .datepicker .vdp-datepicker__calendar .cell.day.disabled:hover {
  border: 1px solid transparent;
}

.c-mask {
  position: fixed;
  z-index: 204;
  top: 0;
  left: 0;
  overflow: hidden;
  width: 0;
  height: 0;
  background-color: #000;
  opacity: 0;
}

.c-mask.is-active {
  width: 100%;
  height: 100%;
}

@media screen and (max-width: 1000px) {
  .button .icon.is-small {
    margin-right: 0;
  }
}

@media screen and (max-width: 768px) {
  .level-left + .level-right {
    display: flex;
    justify-content: left;
  }

  .level-item:not(:last-child) {
     margin-bottom: 0;
  }
}

@media (min-width: 500px) {
  .container {
    margin: 0 auto;
  }
}

@media (max-width: 500px) {
  .container {
    flex: 1;
    width: 100%;
    max-width: 100%;
    display: flex;
  }

  .box {
    margin: 0;
    width: 100%;
    min-width: 100%;
    flex: 1;
  }

  .hero {
    display: flex;
    flex-direction: column;
  }
}
</style>
