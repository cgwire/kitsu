<template>
  <div class="flexrow search-field-wrapper" :class="{ focused }" @click="focus">
    <div class="flexrow-item">
      <search-icon class="search-icon" />
    </div>

    <div class="flexrow-item search-field">
      <input
        ref="input"
        class="search-input"
        type="text"
        :placeholder="placeholder"
        @input="onSearchChange"
        @keyup.enter="onEnterPressed"
        @focus="focused = true"
        @blur="focused = false"
        v-model.trim="search"
        v-focus="focusOptions"
      />
    </div>

    <div class="flexrow-item erase-search">
      <span class="tag" @click="clearSearch"> x </span>
    </div>

    <div class="flexrow-item save-search" v-if="canSave">
      <button class="button save-button" @click="onSaveClicked">
        <save-icon class="icon is-small only-icon" />
      </button>
    </div>
  </div>
</template>

<script>
import { SaveIcon, SearchIcon } from 'vue-feather-icons'

export default {
  name: 'search-field',

  data() {
    return {
      search: '',
      focused: false
    }
  },

  props: {
    placeholder: {
      type: String,
      default: ''
    },
    canSave: {
      type: Boolean,
      default: false
    },
    // FIXME:property no longer used in component
    active: {
      type: Boolean,
      default: true
    },
    focusOptions: {
      type: Object
    }
  },

  components: {
    SaveIcon,
    SearchIcon
  },

  methods: {
    onSearchChange() {
      this.$emit('change', this.search)
    },

    onEnterPressed() {
      this.$emit('enter', this.search)
    },

    onSaveClicked() {
      if (this.search && this.canSave) {
        this.$emit('save', this.search)
      }
    },

    getValue() {
      return this.search
    },

    setValue(value) {
      this.search = value
    },

    focus(options) {
      this.$refs.input?.focus(options)
    },

    clearSearch() {
      this.search = ''
      this.onSearchChange()
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .button.save-button:hover {
    color: $white-grey;
  }

  .search-field-wrapper {
    border: 1px solid #666;

    &.focused {
      box-shadow: 0 0 4px 3px #222;
    }
  }

  .search-input::placeholder {
    color: $grey;
  }
}

.erase-search {
  cursor: pointer;
  margin: 0;
  padding: 0;
}

.search-field {
  margin-right: 0.2em;
}

.search-input {
  width: 300px;
  background: inherit;
  color: var(--text);
}

.search-icon {
  width: 20px;
  margin-top: 5px;
  color: var(--text);
}

.search-input::placeholder {
  color: $light-grey;
}

.save-search {
  margin-right: 0;
}

.save-search .button {
  margin-left: 0.5em;
  border: 0;
  color: $grey-strong;
  padding-right: 0;
}

.save-search .button:hover {
  color: $dark-grey-light;
}

.button.save-button {
  background: transparent;
}

.search-field-wrapper {
  border: 1px solid #ddd;
  border-radius: 2em;
  padding: 0.2em 1em;
  margin-right: 1em;
  transition:
    border 0.5s ease-in-out,
    box-shadow 0.5s ease-in-out;

  &.focused {
    border: 1px solid $green;
    box-shadow: 0 0 4px 3px #eee;
  }
}

.search-field-wrapper:focus,
.search-field-wrapper:hover {
  border-color: $green;
}

@media screen and (max-width: 768px) {
  .search-input {
    width: 200px;
  }
}
</style>
