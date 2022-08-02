<template>
<button
  :class="{
    'level-item': true,
    button: true,
    'is-toggle': true,
    'is-on': buttonIsOn
  }"
  :title="$t(buttonIsOn ? 'tasks.hide_infos' : 'tasks.show_infos')"
  @click="toggleInfos"
>
  <database-icon class="icon is-small" />
</button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  DatabaseIcon
} from 'vue-feather-icons'

export default {
  name: 'show-infos-button',
  components: {
    DatabaseIcon
  },

  props: {
    isBreakdown: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters([
      'isShowInfos',
      'isShowInfosBreakdown'
    ]),

    buttonIsOn () {
      if (this.isBreakdown) {
        return !this.isShowInfosBreakdown
      } else {
        return this.isShowInfos
      }
    }
  },

  methods: {
    ...mapActions([
      'showInfos',
      'showInfosBreakdown',
      'hideInfos',
      'hideInfosBreakdown'
    ]),

    toggleInfos () {
      if (!this.isBreakdown) {
        if (this.isShowInfos) {
          this.hideInfos()
        } else {
          this.showInfos()
        }
      } else {
        if (this.isShowInfosBreakdown) {
          this.hideInfosBreakdown()
        } else {
          this.showInfosBreakdown()
        }
      }
    }
  },

  mounted () {
    if (!this.isBreakdown) {
      if (localStorage.getItem('show-infos') === 'false') {
        this.hideInfos()
      } else {
        this.showInfos()
      }
    } else {
      if (localStorage.getItem('show-infos-breakdown') === 'false') {
        this.hideInfosBreakdown()
      } else {
        this.showInfosBreakdown()
      }
    }
  },

  watch: {
    isShowInfos () {
      localStorage.setItem(
        'show-infos',
        this.isShowInfos,
        { expires: '1M' }
      )
    },

    isShowInfosBreakdown () {
      localStorage.setItem(
        'show-infos-breakdown',
        this.isShowInfosBreakdown,
        { expires: '1M' }
      )
    }
  }
}
</script>
