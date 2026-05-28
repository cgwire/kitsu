<template>
  <base-modal
    :active="active"
    :title="$t('keyboard.shortcuts')"
    @cancel="$emit('cancel')"
  >
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
            <span class="shortcut-plus" v-if="j !== shortcut.keys.length - 1"
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
  </base-modal>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'

const { t } = useI18n()

defineProps({
  active: { type: Boolean, default: false }
})

defineEmits(['cancel'])

const shortcutGroups = computed(() => [
  {
    label: 'keyboard.navigation',
    shortcuts: [
      { keys: ['Alt', '←'], text: t('keyboard.altleft') },
      { keys: ['Alt', '↑'], text: t('keyboard.altup') },
      { keys: ['Alt', '→'], text: t('keyboard.altright') },
      { keys: ['Alt', '↓'], text: t('keyboard.altdown') },
      { keys: ['Ctrl', '←'], text: t('keyboard.ctrlleft') },
      { keys: ['Ctrl', '↑'], text: t('keyboard.ctrlup') },
      { keys: ['Ctrl', '→'], text: t('keyboard.ctrlright') },
      { keys: ['Ctrl', '↓'], text: t('keyboard.ctrldown') }
    ]
  },
  {
    label: 'keyboard.player',
    shortcuts: [
      { keys: ['Space'], text: t('keyboard.play_pause') },
      { keys: ['Alt', 'p'], text: t('keyboard.play_pause_typing') },
      { keys: ['←'], text: t('keyboard.previous_frame') },
      { keys: ['→'], text: t('keyboard.next_frame') },
      { keys: [','], text: t('keyboard.previous_annotation') },
      { keys: ['.'], text: t('keyboard.next_annotation') }
    ]
  },
  {
    label: 'keyboard.playlist_navigation',
    shortcuts: [
      { keys: ['Alt', 'j'], text: t('keyboard.altj') },
      { keys: ['Alt', 'k'], text: t('keyboard.altk') },
      { keys: ['Home'], text: t('keyboard.plhome') },
      { keys: ['End'], text: t('keyboard.plend') },
      { keys: ['Alt', '→'], text: t('keyboard.plaltright') },
      { keys: ['Alt', '←'], text: t('keyboard.plaltleft') },
      { keys: ['Alt', 'o'], text: t('keyboard.plalto') },
      { keys: ['Ctrl', 'Shift', '←'], text: t('keyboard.move_entity_left') },
      { keys: ['Ctrl', 'Shift', '→'], text: t('keyboard.move_entity_right') }
    ]
  },
  {
    label: 'keyboard.annotations',
    shortcuts: [
      { keys: ['d'], text: t('keyboard.draw') },
      { keys: ['Ctrl', 'z'], text: t('keyboard.undo') },
      { keys: ['Alt', 'r'], text: t('keyboard.redo') },
      { keys: ['Ctrl', 'c'], text: t('keyboard.copy_annotation') },
      { keys: ['Ctrl', 'v'], text: t('keyboard.paste_annotation') },
      { keys: ['Suppr'], text: t('keyboard.remove_annotation') },
      { keys: ['Alt', 'Mouse Drag'], text: t('keyboard.pan_image') }
    ]
  },
  {
    label: 'keyboard.object_viewer',
    shortcuts: [
      {
        keys: ['Ctrl', 'Mouse Left Click', 'Drag Horizontal'],
        text: t('keyboard.rotate_hdr')
      },
      {
        keys: ['Mouse Middle Click', 'Drag Horizontal'],
        text: t('keyboard.rotate_hdr')
      },
      {
        keys: ['Alt', 'Mouse Left Click', 'Drag Vertical'],
        text: t('keyboard.change_fov')
      }
    ]
  }
])
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
