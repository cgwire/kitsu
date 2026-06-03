<template>
  <base-modal
    :active="active"
    :title="$t('keyboard.shortcuts')"
    @cancel="$emit('cancel')"
  >
    <div class="shortcut-groups">
      <card
        class="shortcut-group"
        :class="{ 'shortcut-group--wide': shortcutGroup.wide }"
        :key="shortcutGroup.label"
        v-for="shortcutGroup in shortcutGroups"
      >
        <header class="card-head">
          <component
            :is="shortcutGroup.icon"
            :size="16"
            class="card-head-icon"
          />
          <h3 class="card-head-title">{{ $t(shortcutGroup.label) }}</h3>
        </header>

        <div class="shortcut-list">
          <template
            v-for="(shortcut, i) in shortcutGroup.shortcuts"
            :key="`${shortcutGroup.label}-${i}`"
          >
            <span class="shortcut-keys">
              <template v-for="(key, j) in shortcut.keys" :key="j">
                <kbd>{{ key }}</kbd>
                <span
                  class="shortcut-plus"
                  v-if="j !== shortcut.keys.length - 1"
                  >+</span
                >
              </template>
            </span>
            <span class="shortcut-text">{{ shortcut.text }}</span>
          </template>
        </div>
      </card>
    </div>

    <div class="has-text-right modal-footer">
      <button @click="$emit('cancel')" class="button is-link">
        {{ $t('main.close') }}
      </button>
    </div>
  </base-modal>
</template>

<script setup>
import { Box, LayoutGrid, ListVideo, Pencil, Play } from 'lucide-vue-next'
import { computed, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import Card from '@/components/widgets/Card.vue'

const { t } = useI18n()

defineProps({
  active: { type: Boolean, default: false }
})

defineEmits(['cancel'])

const shortcutGroups = computed(() => [
  {
    label: 'keyboard.navigation',
    icon: markRaw(LayoutGrid),
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
    icon: markRaw(Play),
    shortcuts: [
      { keys: ['Space'], text: t('keyboard.play_pause') },
      { keys: ['Alt', 'p'], text: t('keyboard.play_pause_typing') },
      { keys: ['←'], text: t('keyboard.previous_frame') },
      { keys: ['→'], text: t('keyboard.next_frame') },
      { keys: [','], text: t('keyboard.previous_annotation') },
      { keys: ['.'], text: t('keyboard.next_annotation') },
      { keys: ['Shift', 'Mouse Drag'], text: t('keyboard.scrub_anywhere') },
      { keys: ['Shift', 'Tab'], text: t('keyboard.focus_comment') }
    ]
  },
  {
    label: 'keyboard.playlist_navigation',
    icon: markRaw(ListVideo),
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
    icon: markRaw(Pencil),
    shortcuts: [
      { keys: ['d'], text: t('keyboard.draw') },
      { keys: ['e'], text: t('keyboard.erase') },
      { keys: ['Shift', 'Mouse Drag'], text: t('keyboard.straight_line') },
      { keys: ['Ctrl', 'Mouse Drag'], text: t('keyboard.constant_width') },
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
    icon: markRaw(Box),
    wide: true,
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
:deep(.modal-content) {
  width: 820px;
  max-width: calc(100vw - 2em);
}

.shortcut-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 1.25em;
  margin-top: 0.5em;
}

.shortcut-group--wide {
  grid-column: 1 / -1;
}

// The modal box is white in the light theme, so a white card would melt into
// it; tint the cards one step darker. Settings/Profile keep Card's default
// white because there the cards sit on a grey page. Higher specificity than
// Card's own `.card` rule so this wins.
.shortcut-groups .shortcut-group {
  background: var(--background-alt);
}

.card-head {
  align-items: center;
  display: flex;
  gap: 0.5em;
  margin-bottom: 1.1rem;
}

.card-head-icon {
  color: var(--background-selectable, $purple-strong);
  flex-shrink: 0;
}

.card-head-title {
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
}

.shortcut-list {
  display: grid;
  grid-template-columns: minmax(0, max-content) 1fr;
  align-items: center;
  gap: 0.45em 1em;
}

.shortcut-keys {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3em;
  min-width: 0;
}

kbd {
  border: 1px solid var(--border);
  border-radius: 0.35em;
  box-shadow:
    inset 0 -2px 0 var(--border),
    0 1px 1px rgba(0, 0, 0, 0.06);
  padding: 0.16em 0.5em 0.24em;
  min-width: 1.9em;
  font-family: inherit;
  font-size: 0.82em;
  line-height: 1.5;
  text-align: center;
  color: var(--text);
  background: var(--background-hover, #efefef);
}

.shortcut-plus {
  color: var(--text-secondary, $grey);
  font-size: 0.8em;
}

.shortcut-text {
  color: var(--text);
}

@media screen and (max-width: 768px) {
  .shortcut-groups {
    grid-template-columns: 1fr;
  }
}
</style>
