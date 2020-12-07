<template>
<td
  class="description-cell"
  @click="onClick"
>
  <span
    class="description-shorten-text"
    v-html="compileMarkdown(shortenText(entry.description || '', 20))"
  >
  </span>
  <div
    class="tooltip"
    @dblclick="onDoubleClick"
    v-if="isOpen"
  >
    <div
      class="tooltip-text"
      v-html="compileMarkdown(entry.description)"
      v-if="!isEditing"
    >
    </div>
    <textarea
      class="tooltip-editor"
      :value="entry.description"
      v-else
    >
    </textarea>
  </div>
</td>
</template>

<script>
import marked from 'marked'
import { mapGetters, mapActions } from 'vuex'
import stringHelpers from '../../lib/string'

export default {
  name: 'description-cell',
  data () {
    return {
      isEditing: false,
      isOpen: false,
      timeout: null
    }
  },

  components: {
  },

  props: {
    entry: {
      type: Object,
      default: () => {}
    },
    full: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
    ]),

    content () {
      return this.compileMarkdown(this.entry.description)
    }
  },

  methods: {
    ...mapActions([
    ]),

    compileMarkdown (input) {
      return marked(input || '')
    },
    shortenText: stringHelpers.shortenText,

    onClick (event) {
      if (
        event.target.className.substring(0, 11) === 'description' ||
        event.target.parentNode.className.substring(0, 11) === 'description'
      ) {
        this.isOpen = !this.isOpen
      }
    },

    onDoubleClick () {
      this.isEditing = !this.isEditing
    }
  }
}
</script>

<style lang="scss" scoped>
.no-avatar {
  width: 30px;
}

.last-comment {
  margin-left: 0.6em;
}

.no-comment {
  font-style: italic;
}

.description {
  cursor: pointer;
}

td {
  position: relative;
}

.description-shorten-text {
  min-width: 100px;
  min-height: 30px;
}

.description-cell .tooltip {
  background-color: $white;
  border-radius: .5rem;
  display: block;
  font-size: 0.8em;
  left: 50%;
  min-height: 100px;
  max-height: 300px;
  padding: .5rem;
  position: absolute;
  top: 3rem;
  transform: translatex(-50%);
  width: 250px;
  box-shadow: 0 2px 3px $grey;

  p {
    margin: 1em;
  }

  .tooltip-text {
    padding: 0.5em;
    overflow-y: auto;
    height: 280px;
  }

  textarea {
    box-shadow: inset 0 0 3px 0px $grey;
    padding: 0.5em;
    color: inherit;
    font-size: 0.95em;
    height: 100%;
    line-height: 1.7em;
    min-height: 280px;
    width: 100%;

    &:focus {
      outline: none;
    }
  }

  &:after {
    position: absolute;
    top: -1rem;
    left: 50%;
    transform: translatex(-50%);

    height: 0;
    width: 0;

    border: .5rem solid;
    border-color: transparent transparent $white;

    content: '';
  }
}
</style>
