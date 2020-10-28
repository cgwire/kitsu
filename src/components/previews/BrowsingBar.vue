<template>
<div class="left flexrow">
  <button-simple
    class="flexrow-item"
    icon="left"
    :title="$t('playlists.actions.files_previous')"
    @click="$emit('previous-clicked')"
    v-if="(!light || fullScreen) && previews.length > 1"
  />

  <span
    class="flexrow-item bar-element current-index"
    :title="$t('playlists.actions.files_position')"
    @click="$emit('current-index-clicked')"
    v-if="(!light || fullScreen) && previews.length > 1"
  >
    {{ currentIndex }} / {{ previews.length }}
  </span>

  <button-simple
    class="flexrow-item"
    icon="right"
    :title="$t('playlists.actions.files_next')"
    @click="$emit('next-clicked')"
    v-if="(!light || fullScreen) && previews.length > 1"
  />

  <button-simple
    class="flexrow-item"
    icon="plus"
    :title="$t('playlists.actions.files_add')"
    @click="$emit('add-preview-clicked')"
    v-if="!readOnly && !fullScreen"
  />

  <button-simple
    class="flexrow-item"
    icon="delete"
    :title="$t('playlists.actions.files_delete')"
    @click="$emit('remove-preview-clicked')"
    v-if="!readOnly && !fullScreen"
  />
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonSimple from '@/components/widgets/ButtonSimple'

export default {
  name: 'browsing-bar',

  components: {
    ButtonSimple
  },

  props: {
    previews: {
      type: Array,
      default: () => []
    },
    currentIndex: {
      type: Number,
      default: 0
    },
    light: {
      type: Boolean,
      default: false
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ])
  },

  watch: {}
}
</script>

<style lang="scss" scoped>
.error {
  margin-top: 1em;
}

.buttons .button {
  background: transparent;
  border-radius: 0;
  color: #BBB;
  border: 0;
  margin: 0;
  transition: all 0.3 ease;

  &:first-child {
    border-bottom-left-radius: 5px;
  }

  &:hover {
    border-radius: 5px;
    transform: scale(1.2);
  }
}

.buttons .button.active,
.buttons .button:hover {
  color: #43B581;
}

.bar-element {
  color: $light-grey;
  padding-left: 1em;
}

.current-index {
  cursor: pointer;
}
</style>
