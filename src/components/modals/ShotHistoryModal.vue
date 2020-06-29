<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title">
        {{ $t('shots.history') }}
      </h1>

      <table class="table" ref="headerWrapper">
        <thead class="table-header">
          <tr>
            <th class="date">{{ $t('main.date') }}</th>
            <th class="name">{{ $t('shots.fields.name') }}</th>
            <th class="frame-in">{{ $t('shots.fields.frame_in') }}</th>
            <th class="frame-out">{{ $t('shots.fields.frame_out') }}</th>
            <th class="table-filler">&nbsp;</th>
          </tr>
        </thead>
      </table>

      <div
        class="table-body"
        v-if="!isLoading"
      >
        <table class="table">
          <tbody class="table-body">
            <tr
              class="shot-version"
              :key="version.id"
              v-for="version in versions"
            >
              <td class="date">
                {{ formatDate(version.created_at) }}
              </td>
              <td class="name">
                {{ version.name }}
              </td>
              <td class="frame-in">
                {{ version.data.frame_in }}
              </td>
              <td class="frame-out">
                {{ version.data.frame_out }}
              </td>
              <td class="table-filler"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <table-info
        :is-loading="isLoading"
        :is-error="isError"
      />

      <div class="has-text-right modal-footer">
        <button
          @click="$emit('cancel')"
          class="button is-link"
        >
          {{ $t('main.cancel') }}
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import { formatDate } from '../../lib/time'

import TableInfo from '../widgets/TableInfo'

export default {
  name: 'shot-history-modal',
  mixins: [modalMixin],

  components: {
    TableInfo
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    shot: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      isError: false,
      isLoading: false,
      versions: []
    }
  },

  mounted () {
    this.reset()
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
      'loadShotHistory'
    ]),

    reset () {
      this.versions = []
      this.isError = false
      this.isLoading = false
    },

    loadData () {
      this.isError = false
      this.isLoading = true
      return this.loadShotHistory(this.shot.id)
        .then((versions) => {
          this.versions = versions
          this.isLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.isLoading = false
          this.isError = true
        })
    },

    formatDate (dateString) {
      return formatDate(dateString)
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.reset()
        this.loadData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .table tr:nth-child(odd) {
    color: $white-grey;
    background: #36393F;
  }

  .table tr:nth-child(even) {
    color: $white-grey;
    background: #46494F;
  }
}

.modal .table {
  margin-bottom: 0;
}

.modal-footer {
  margin-top: 1em;
}

.table tr .date {
  min-width: 160px;
  max-width: 160px;
  width: 160px;
}

.name {
  min-width: 160px;
  width: 160px;
}

.frame-out,
.frame-in {
  min-width: 80px;
  width: 80px;
}

.table-filler {
  width: 100%;
}
</style>
