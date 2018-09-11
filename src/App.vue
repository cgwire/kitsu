<template>
  <div
    class="has-text-centered mt2 loading-info"
    v-if="isLoginLoading && user"
  >
      <span>{{ $t('main.loading_data') }}...</span>
    <spinner class="mt2" />
  </div>
  <router-view v-else />
</template>

<script>
import { mapGetters } from 'vuex'
import Spinner from './components/widgets/Spinner.vue'

export default {
  name: 'app',

  components: {
    Spinner
  },

  computed: {
    ...mapGetters([
      'isLoginLoading',
      'user'
    ])
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
    onAssignation (eventData) {
      const store = this.$store
      if (store.getters.route.path.indexOf(eventData.person_id) > 0) {
        store.dispatch('loadPersonTasks', {
          personId: eventData.person_id,
          forced: true
        })
      }
    }
  },

  socket: {
    events: {
      'task:assign' (eventData) {
        this.onAssignation(eventData)
      },

      'task:unassign' (eventData) {
        this.onAssignation(eventData)
      },

      'comment:new' (eventData) {
        const commentId = eventData.comment_id
        this.$store.dispatch('loadComment', {commentId})
      },

      'task:update' (eventData) {
        this.$store.dispatch('getTask', { taskId: eventData.task_id })
      }
    }
  }
}
</script>

<style>
:focus {outline:none;}
::-moz-focus-inner {border:0;}

html {
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

#app .router-link-active {
  color: #00d1b2;
}

.loading-info {
  background: white;
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

.mt2 {
  margin-top: 2em;
}

input.input:focus {
  border-color: #00B242;
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

.search-input {
  border: 0;
  box-shadow: none;
  border-radius: 0;
  border-bottom: 2px solid #CCC
}

input.search-input:focus {
  border-color: #8F91EB;
}

.filters-area {
  margin-bottom: 1em;
}

.query-list {
  margin-bottom: 2em;
  margin-left: 2.5em;
}

.query-list .tag {
  margin-right: 1em;
  border: 1px solid transparent;
}

.query-list .tag .delete {
  margin-left: 0.5em;
  transform: scale(0.6)
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

.flexrow {
  display: flex;
  align-items: center;
}

.flexrow-item {
  margin-right: 1em;
}

.flexrow-item:last-child {
  margin-right: 0;
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

.modal-content .button {
  margin-left: 0.5em;
}

.unselectable {
  user-select: none;
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
  width: 190px;
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
