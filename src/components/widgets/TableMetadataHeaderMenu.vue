<template>
  <div class="header-menu hidden">
    <div
      @click="$emit('edit-clicked')"
      v-if="isCurrentUserAdmin"
    >
      {{ $t('main.edit')}}
    </div>
    <div
      class="error"
      @click="$emit('delete-clicked')"
      v-if="isCurrentUserAdmin"
    >
      {{ $t('main.delete')}}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'table-metadata-header-menu',

  props: {
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
  background-color: #36393F;
  box-shadow: 0px 2px 6px #333;
}

.header-menu {
  position: absolute;
  background: white;
  width: 118px;
  box-shadow: 0px 2px 6px #CCC;
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
