<template>
  <div class="header-menu hidden">
    <div @click="$emit('edit-clicked')" v-if="isEditAllowed">
      {{ $t('main.edit') }}
    </div>
    <div @click="$emit('sort-by-clicked')">
      {{ $t('main.sort_by') }}
    </div>
    <div @click="$emit('toggle-stick')">
      <template v-if="isSticked">
        {{ $t('main.unstick') }}
      </template>
      <template v-else>
        {{ $t('main.stick') }}
      </template>
    </div>
    <div class="error" @click="$emit('delete-clicked')" v-if="isEditAllowed">
      {{ $t('main.delete') }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'table-metadata-header-menu',

  props: {
    isEditAllowed: {
      type: Boolean,
      default: false
    },
    isSticked: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters([])
  },

  methods: {
    ...mapActions([])
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
  width: 128px;
  box-shadow: 0px 2px 6px $light-grey;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  top: 90px;
  z-index: 1001; // Needed to be above the sticky cells
}

.header-menu div {
  cursor: pointer;
}

.header-menu div {
  padding: 0.5em;
}
</style>
