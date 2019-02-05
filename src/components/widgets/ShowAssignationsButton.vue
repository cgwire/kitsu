<template>
<button
 :class="{
    'level-item': true,
    button: true,
    'is-toggle': true,
    'is-on': isShowAssignations
  }"
  :title="$t(isShowAssignations ? 'tasks.hide_assignations' : 'tasks.show_assignations')"
  @click="toggleAssignations"
>
  <users-icon class="icon is-small" />
</button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  UsersIcon
} from 'vue-feather-icons'

export default {
  name: 'show-assignations-button',
  components: {
    UsersIcon
  },

  props: {},

  computed: {
    ...mapGetters([
      'isShowAssignations'
    ])
  },

  methods: {
    ...mapActions([
      'showAssignations',
      'hideAssignations'
    ]),

    toggleAssignations () {
      if (this.isShowAssignations) {
        this.hideAssignations()
      } else {
        this.showAssignations()
      }
    }
  },

  mounted () {
    if (localStorage.getItem('show-assignations') === 'false') {
      this.hideAssignations()
    } else {
      this.showAssignations()
    }
  },

  watch: {
    isShowAssignations () {
      localStorage.setItem(
        'show-assignations',
        this.isShowAssignations,
        {expires: '1M'}
      )
    }
  }
}
</script>
