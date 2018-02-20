<template>
<button
  class="level-item button"
  @click="hideAssignations"
  v-if="isShowAssignations"
>
  <eye-off-icon class="icon is-small"></eye-off-icon>
  <span class="text is-hidden-touch">Hide assignations</span>
</button>
<button
  class="level-item button"
  @click="showAssignations"
  v-else
>
  <eye-icon class="icon is-small"></eye-icon>
  <span class="text is-hidden-touch">Show assignations</span>
</button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  EyeIcon,
  EyeOffIcon
} from 'vue-feather-icons'

export default {
  name: 'show-assignations-button',
  components: {
    EyeIcon,
    EyeOffIcon
  },
  props: {
  },
  computed: {
    ...mapGetters([
      'isShowAssignations'
    ])
  },
  methods: {
    ...mapActions([
      'showAssignations',
      'hideAssignations'
    ])
  }

}
</script>
