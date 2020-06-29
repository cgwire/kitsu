<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title">
        {{ $t('keyboard.shortcuts') }}
      </h1>

      <div
        class="mt2"
        :key="shortcutGroup.label"
        v-for="shortcutGroup in shortcutGroups"
      >
        <h3>
          {{ $t(shortcutGroup.label) }}
        </h3>

        <div
          class="shortcut"
          :key="`shortcut-${i}`"
          v-for="(shortcut, i) in shortcutGroup.shortcuts"
        >
          <div
            class="shortcut-key-wrapper"
          >
            <div
              :key="`shortcut-key-${i}-${j}`"
              v-for="(key, j) in shortcut.keys"
            >
              <span class="shortcut-key">{{ key }}</span>
              <span
                class="shortcut-plus"
                v-if="j !== shortcut.keys.length - 1"
               >+
               </span>
            </div>
          </div>
          <span class="shortcut-text">{{ shortcut.text }}</span>
        </div>
      </div>

      <div class="has-text-right modal-footer">
        <button
          @click="$emit('cancel')"
          class="button is-link"
        >
          {{ $t('main.cancel') }}
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'

export default {
  name: 'shot-history-modal',
  mixins: [modalMixin],

  components: {
  },

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      shortcutGroups: [
        {
          label: 'keyboard.navigation',
          shortcuts: [
            {
              keys: ['Alt', '←'],
              text: this.$t('keyboard.altleft')
            },
            {
              keys: ['Alt', '↑'],
              text: this.$t('keyboard.altup')
            },
            {
              keys: ['Alt', '→'],
              text: this.$t('keyboard.altright')
            },
            {
              keys: ['Alt', '↓'],
              text: this.$t('keyboard.altdown')
            }
          ]
        },
        {
          label: 'keyboard.playlist_navigation',
          shortcuts: [
            {
              keys: ['Alt', 'j'],
              text: this.$t('keyboard.altj')
            },
            {
              keys: ['Alt', 'k'],
              text: this.$t('keyboard.altk')
            }
          ]
        },
        {
          label: 'keyboard.annotations',
          shortcuts: [
            {
              keys: ['Ctrl', 'z'],
              text: this.$t('keyboard.undo')
            },
            {
              keys: ['Alt', 'r'],
              text: this.$t('keyboard.redo')
            },
            {
              keys: ['Alt', 'd'],
              text: this.$t('keyboard.draw')
            },
            {
              keys: ['Suppr'],
              text: this.$t('keyboard.remove_annotation')
            }
          ]
        }

      ]
    }
  },

  mounted () {
    this.reset()
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
      'loadShotHistory'
    ]),

    reset () {
    },

    formatDate (dateString) {
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .shortcut-key {
    border: 2px solid $white;
  }
}

.shortcut-key-wrapper {
  min-width: 110px;
  display: inline-block;
  padding: 0.8em;

  div {
    display: inline-block;
  }
}

.shortcut-key {
  border-radius: 0.3em;
  border: 2px solid $dark-grey;
  padding: 0.3em;
}

.shortcut-plus {
  padding: 0 0.5em;
  margin: 0;
}
</style>
