<template>
<div class="pencil-wrapper">
  <button
    type="button"
    class="pencil-picker"
    :title="$t(`playlists.actions.annotation_${pencil}`)"
    :class="{
      medium: pencil === 'medium',
      small: pencil === 'small'
    }"
    @click="togglePalette"
  />
  <div
    v-show="isOpen"
    class="pencil-palette"
  >
    <label
      v-for="pencil in sizes"
      :key="pencil"
      :title="$t(`playlists.actions.annotation_${pencil}`)"
      :class="{
        medium: pencil === 'medium',
        small: pencil === 'small'
      }"
    >
      <input
        type="radio"
        :value="pencil"
        @click="onPencilPicked(pencil)"
      />
    </label>
  </div>
</div>
</template>

<script>
export default {
  name: 'pencilpicker',

  props: {
    pencil: {
      type: String
    },
    sizes: {
      type: Array
    }
  },

  data () {
    return {
      isOpen: false
    }
  },

  computed: {
  },

  methods: {
    togglePalette () {
      this.isOpen = !this.isOpen
    },

    onPencilPicked (width) {
      this.$emit('change', width)
      this.isOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>
.pencil-wrapper {
  position: relative;
  display: inline-flex;
}
.pencil-picker {
  padding: 0;
  background-color: transparent;
  cursor: pointer;
}
.pencil-picker {
  background-color: transparent;
  min-width: 1.5rem
}
.pencil-picker::before,
.pencil-palette label::before {
  display: block;
  content: '';
  margin: .4rem auto;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: $light-grey;
}

.pencil-picker.medium::before,
.pencil-palette label.medium::before {
  margin: .5rem auto;
  width: .7rem;
  height: .7rem;
}

.pencil-picker.small::before,
.pencil-palette label.small::before {
  margin: .55rem auto;
  width: .5rem;
  height: .5rem;
}

.pencil-palette {
  position: absolute;
  z-index: 900;
  left: 0;
  bottom: calc(100% - .25rem);
  background-color: $dark-grey-light;
  border-radius: 5px;
  padding: 0 .25rem;
}
.preview .pencil-palette {
  background-color: $dark-grey;
}
.pencil-palette label {
  display: block;
  margin: .5rem 0;
  cursor: pointer;
}
.pencil-palette input {
  display: none;
}
</style>
