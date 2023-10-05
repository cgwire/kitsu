<template>
  <div class="left flexrow">
    <button-simple
      class="flexrow-item"
      icon="left"
      :title="$t('playlists.actions.files_previous')"
      @click="$emit('previous-clicked')"
      v-if="isBigDisplay || !isMovie"
    />

    <div
      class="flexrow-item bar-element current-index"
      :title="$t('playlists.actions.files_position')"
      @click="$emit('current-index-clicked')"
      v-if="isBigDisplay || !isMovie"
    >
      <span>{{ currentIndex }}</span>
      <span v-if="fullScreen || !isMovie"> / {{ previews.length }}</span>
    </div>

    <button-simple
      class="flexrow-item"
      icon="right"
      :title="$t('playlists.actions.files_next')"
      @click="$emit('next-clicked')"
      v-if="isBigDisplay || !isMovie"
    />

    <button-simple
      class="flexrow-item"
      icon="plus"
      :title="$t('playlists.actions.files_add')"
      @click="$emit('add-preview-clicked')"
      v-if="(isAssigned || !readOnly) && !fullScreen"
    />

    <button-simple
      class="flexrow-item"
      icon="delete"
      :title="$t('playlists.actions.files_delete')"
      @click="$emit('remove-preview-clicked')"
      v-if="!readOnly && !fullScreen && !light"
    />

    <div class="separator" v-if="isBigDisplay"></div>
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
    currentIndex: {
      type: Number,
      default: 0
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    isAssigned: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    },
    previews: {
      type: Array,
      default: () => []
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([]),

    isBigDisplay() {
      return (!this.light || this.fullScreen) && this.previews.length > 1
    },

    isMovie() {
      if (this.previews.length < this.currentIndex) {
        return false
      } else {
        return this.previews[this.currentIndex - 1].extension === 'mp4'
      }
    }
  },

  methods: {
    ...mapActions([])
  },

  watch: {}
}
</script>

<style lang="scss" scoped>
.error {
  margin-top: 1em;
}

.buttons .button {
  background: $dark-grey-2;
  border-radius: 0;
  color: #bbb;
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
  color: #43b581;
}

.bar-element {
  color: $light-grey;
  padding-left: 1em;
}

.current-index {
  cursor: pointer;
  white-space: nowrap;
}
</style>
