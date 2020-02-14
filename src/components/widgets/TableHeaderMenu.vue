<template>
  <div class="header-menu hidden">
    <div
      @click="$emit('minimize-clicked')"
    >
      <span v-if="isMinimized">
        {{ $t('main.maximize') }}
      </span>
      <span v-else>{{ $t('main.minimize') }}</span>
    </div>
    <div
      @click="$emit('sort-by-clicked')"
    >
      {{ $t('main.sort_by')}}
    </div>
    <div
      class="error"
      @click="$emit('delete-all-clicked')"
      v-if="isCurrentUserAdmin"
    >
      {{ $t('main.delete_all')}}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'table-header-menu',

  props: {
    isMinimized: {
      type: Boolean,
      default: false
    },
    isCurrentUserAdmin: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
.dark .header-menu {
  background-color: $dark-grey-light;
  box-shadow: 0px 2px 6px $dark-grey-light;
}

.header-menu {
  position: absolute;
  background: white;
  width: 118px;
  box-shadow: 0px 2px 6px $light-grey;
  top: 90px;
  z-index: 100;
}

.header-menu div {
  cursor: pointer;
}

.header-menu div {
  padding: 0.5em;
}
</style>
