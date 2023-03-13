<template>
  <div class="flexrow">
    <div class="flexrow-item is-wide" v-if="!isLoading">
      <button class="button is-danger is-wide" @click="$emit('confirm')">
        {{ text }}
      </button>
    </div>
    <div class="flexrow-item" v-else>
      <spinner :size="20" class="spinner" />
    </div>
    <div class="flexrow-item error" v-if="isError">
      {{ errorText }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'delete-entities',

  components: {
    Spinner
  },

  data() {
    return {}
  },

  props: {
    isError: {
      default: false,
      type: Boolean
    },
    isLoading: {
      default: false,
      type: Boolean
    },
    errorText: {
      default: '',
      type: String
    },
    text: {
      default: '',
      type: String
    }
  },

  mounted() {},

  computed: {
    ...mapGetters([])
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
.is-wide {
  margin: 0;
  border-radius: 10px;
  flex: 1;
  width: 100%;
}
</style>
