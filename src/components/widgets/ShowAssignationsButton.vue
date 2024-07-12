<template>
  <button
    :class="{
      'level-item': true,
      button: true,
      'is-toggle': true,
      'is-on': isShowAssignations
    }"
    :title="
      $t(
        isShowAssignations
          ? 'tasks.hide_assignations'
          : 'tasks.show_assignations'
      )
    "
    @click="toggleAssignations"
  >
    <kitsu-icon
      class="icon is-small"
      name="user"
      :title="
        $t(
          isShowAssignations
            ? 'tasks.hide_assignations'
            : 'tasks.show_assignations'
        )
      "
    />
  </button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

export default {
  name: 'show-assignations-button',

  components: {
    KitsuIcon
  },

  computed: {
    ...mapGetters(['isShowAssignations'])
  },

  methods: {
    ...mapActions(['showAssignations', 'hideAssignations']),

    toggleAssignations() {
      if (this.isShowAssignations) {
        this.hideAssignations()
      } else {
        this.showAssignations()
      }
    }
  },

  mounted() {
    if (localStorage.getItem('show-assignations') === 'false') {
      this.hideAssignations()
    } else {
      this.showAssignations()
    }
  },

  watch: {
    isShowAssignations() {
      localStorage.setItem('show-assignations', this.isShowAssignations, {
        expires: '1M'
      })
    }
  }
}
</script>

<style scoped>
.button {
  border-radius: 10px;
  padding: 0 10px;
}

.button .icon {
  height: 18px;
  width: 18px;
}
</style>
