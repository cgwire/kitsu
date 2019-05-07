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
      'assetTypeMap',
      'isLoginLoading',
      'isDataLoading',
      'isDarkTheme',
      'isSavingCommentPreview',
      'route',
      'personMap',
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
      'getTask',
      'loadAsset',
      'loadAssetType',
      'loadComment',
      'loadPerson',
      'loadPersonTasks',
      'loadTaskStatus',
      'loadTaskType',
      'refreshPreview',
      'refreshMetadataDescriptor',
      'removeAsset'
    ]),

    onAssignation (eventData) {
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

      'entity-type:new' (eventData) {
        if (!this.assetTypeMap[eventData.entity_type_id]) {
          this.loadAssetType(eventData.entity_type_id)
        }
      },

      'entity-type:update' (eventData) {
        if (this.assetTypeMap[eventData.entity_type_id]) {
          this.loadAssetType(eventData.entity_type_id)
        }
      },

      'entity-type:delete' (eventData) {
        if (this.assetTypeMap[eventData.entity_type_id]) {
          this.$store.commit(
            'DELETE_ASSET_TYPE_END',
            { id: eventData.entity_type_id }
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
        this.onAssignation(eventData)
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
        this.refreshMetadataDescriptor(eventData.descriptor_id)
      },

      'metadata-descriptor:update' (eventData) {
        this.refreshMetadataDescriptor(eventData.descriptor_id)
      },

      'metadata-descriptor:delete' (eventData) {
        this.$store.commit('DELETE_METADATA_DESCRIPTOR_END', {
          id: eventData.descriptor_id
        })
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
    border-bottom: 3px solid #008732;
  }

  .add-comment .select select {
    background: #4E5159;
  }

  .hero .box h1.title {
    color: #DDD;
  }

  .table-body .table tr:nth-child(odd) {
    color: $white-grey;
    background: #46494F;
  }

  .table-header,
  .table-header tr:hover,
  .table-body .table tr:nth-child(even) {
    color: $white-grey;
    background: #36393F;
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
    border-top: 1px solid #25282E;
    font-size: 1.1em;
  }

  .table tr.type-header:hover {
    background: #46494F;
  }

  .table tr.type-header td {
    font-weight: bold;
    padding-left: 0.3em;
  }

  .splitted-table {
    border-left: 1px solid #36393F;
  }

  .splitted-table tr {
    border-right: 1px solid #25282E;
    border-left: 1px solid #25282E;
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

  .splitted-table tbody:first-child tr:first-child {
    border-top: 1px solid #25282E;
  }

  .splitted-table .empty-line {
    border: 0;
  }

  .splitted-table .empty-line td {
    border-color: #36393F;
    background: #36393F;
    border: 0;
  }

  .splitted-table tbody {
    border-bottom: 1px solid #25282E;
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

  .current-date .datepicker .vdp-datepicker__calendar {
    background-color: #36393F;
    border-color: #25282E;
  }
  .current-date .datepicker .vdp-datepicker__calendar header span:hover {
    background: #36393F;
  }
  .current-date .datepicker .vdp-datepicker__calendar header .prev::after {
    border-right-color: #EEE;
  }
  .current-date .datepicker .vdp-datepicker__calendar header .next::after {
    border-left-color: #EEE;
  }

  .current-date .datepicker .vdp-datepicker__calendar header .next.disabled::after {
    border-left-color: #666;
  }

  .hero .control .icon {
    color: #555;
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
  min-width: 100px;
}

td.actions {
  min-width: 100px;
}

ul {
  list-style-type: disc;
  margin-left: 1em;
}

.hero {
  background-color: #CFCFCF;
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

tr td.actions a {
  opacity: 0;
  color: #999;
}

tr th.actions a {
  color: #999;
}

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
  margin-top: 2em;
  font-size: 1.4em;
}

.canceled td:not(.actions) {
  text-decoration: line-through;
}

.field {
  margin-bottom: 2em;
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

.filler {
  flex: 1;
}

.select select:hover,
.select select:active,
.select select:focus,
input.input:focus {
  border-color: #00B242;
  outline: none;
}

.button:focus {
  box-shadow: none;
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
  border-radius: 2px;
  min-height: 2.8em;
  color: white;
  border-color: #5e60ba;
  padding: 12px 12px 12px 12px;
  margin: .3em 0 0em 0;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  background: #00B242;
  color: #fff;
  border: 0;
  border-bottom: 3px solid #008732;
  transition: all 0.15s ease;
  width: 100%;
  display: block;
  text-align: center;
}

.main-button:hover {
  background: #67BE4B;
  color: #fff;
  border-bottom: 3px solid #119843;
}

.main-button:focus { outline: 0; }

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
  border-bottom: 2px solid #CCC
}

input.search-input:focus {
  border-color: #8F91EB;
}

.filters-area {}

.query-list {
  margin-top: 1em;
  margin-bottom: 2em;
  margin-left: 2.5em;
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
}

.table-header th.actions {
  width: 100%;
}

.table-header .header-icon {
  width: 15px;
  cursor: pointer;
  opacity: 0;
}

.table-header th:hover .header-icon {
  opacity: 100;
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
  background: #F0FFF0;
}

.table tr.type-header {
  border-top: 1px solid #CCC;
  font-size: 1.1em;
}

.table tr.type-header:hover {
  background: transparent;
}

.table tr.type-header td {
  font-weight: bold;
  padding-left: 0.3em;
}

.splitted-table tr {
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

.splitted-table tbody:first-child tr:first-child {
  border-top: 1px solid #CCC;
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
  margin-left: 0.3em;
  margin-top: 7px;
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
  font-size: 1.6em;
  width: 250px;
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
