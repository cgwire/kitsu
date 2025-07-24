<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

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
            <div class="shortcut-key-wrapper">
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
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

export default {
  name: 'shortcut-modal',

  mixins: [modalMixin],

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cancel'],

  data() {
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
            },
            {
              keys: ['Ctrl', '←'],
              text: this.$t('keyboard.ctrlleft')
            },
            {
              keys: ['Ctrl', '↑'],
              text: this.$t('keyboard.ctrlup')
            },
            {
              keys: ['Ctrl', '→'],
              text: this.$t('keyboard.ctrlright')
            },
            {
              keys: ['Ctrl', '↓'],
              text: this.$t('keyboard.ctrldown')
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
            },
            {
              keys: ['Home'],
              text: this.$t('keyboard.plhome')
            },
            {
              keys: ['End'],
              text: this.$t('keyboard.plend')
            },
            {
              keys: ['Alt', '→'],
              text: this.$t('keyboard.plaltright')
            },
            {
              keys: ['Alt', '←'],
              text: this.$t('keyboard.plaltleft')
            },
            {
              keys: ['Alt', 'o'],
              text: this.$t('keyboard.plalto')
            }
          ]
        },
        {
          label: 'keyboard.object_viewer',
          shortcuts: [
            {
              keys: ['Ctrl', 'Mouse Left Click', 'Drag Horizontal'],
              text: this.$t('keyboard.rotate_hdr')
            },
            {
              keys: ['Mouse Middle Click', 'Drag Horizontal'],
              text: this.$t('keyboard.rotate_hdr')
            },
            {
              keys: ['Alt', 'Mouse Left Click', 'Drag Vertical'],
              text: this.$t('keyboard.change_fov')
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
  }
}
</script>

<style lang="scss" scoped>
.dark {
  h3 {
    color: $white;
  }
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
