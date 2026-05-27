<template>
  <header class="shared-header flexrow">
    <a
      class="kitsu-logo-link"
      href="https://www.cg-wire.com/kitsu"
      target="_blank"
      rel="noopener"
      :title="$t('share.kitsu_homepage')"
    >
      <img class="kitsu-logo" src="@/assets/kitsu.png" alt="Kitsu" />
    </a>
    <span class="project-name uppercase" v-if="projectName">
      {{ projectName }}
    </span>
    <span class="header-separator" v-if="projectName">|</span>
    <span class="playlist-name">{{ playlistName }}</span>
    <span class="header-separator" v-if="playlistName">|</span>

    <div class="flexrow flexrow-item entity-nav">
      <button-simple
        class="playlist-button flexrow-item"
        icon="back"
        :title="$t('playlists.actions.previous_shot')"
        @click="$emit('previous-entity')"
      />
      <button-simple
        class="playlist-button flexrow-item"
        icon="forward"
        :title="$t('playlists.actions.next_shot')"
        @click="$emit('next-entity')"
      />
      <span class="flexrow-item entity-counter">
        {{ entityCount > 0 ? playingEntityIndex + 1 : 0 }}
        /
        {{ entityCount }}
      </span>
    </div>

    <span
      class="flexrow-item current-entity-name"
      :title="currentEntityDisplayName"
      v-if="currentEntityDisplayName"
    >
      {{ currentEntityDisplayName }}
    </span>

    <div class="filler"></div>

    <span
      class="flexrow-item guest-name"
      :title="guestDisplayName"
      v-if="guestDisplayName"
    >
      {{ guestDisplayName }}
    </span>
    <button
      class="logout-button flexrow-item"
      :title="$t('share.logout')"
      @click="$emit('logout')"
      v-if="guestId"
    >
      <log-out-icon class="icon" :size="16" />
    </button>
  </header>
</template>

<script setup>
import { LogOutIcon } from 'lucide-vue-next'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

defineProps({
  currentEntityDisplayName: { type: String, default: '' },
  entityCount: { type: Number, default: 0 },
  guestDisplayName: { type: String, default: '' },
  guestId: { type: String, default: '' },
  playingEntityIndex: { type: Number, default: 0 },
  playlistName: { type: String, default: '' },
  projectName: { type: String, default: '' }
})

defineEmits(['logout', 'next-entity', 'previous-entity'])
</script>

<style lang="scss" scoped>
.shared-header {
  align-items: center;
  backdrop-filter: blur(14px);
  background: rgba(20, 20, 26, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(244, 245, 250, 0.6);
  flex-shrink: 0;
  gap: 0.8em;
  height: 52px;
  padding: 0 1.4em;

  .current-entity-name {
    color: #f4f5fa;
    font-size: 0.9em;
    font-weight: 500;
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entity-counter {
    color: rgba(244, 245, 250, 0.6);
    font-size: 0.82em;
    font-variant-numeric: tabular-nums;
    margin: 0 0.4em;
  }

  .entity-nav {
    align-items: center;
    background: #0e0e13;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    gap: 0.25em;
    padding: 0.15em 0.5em;
  }

  .filler {
    flex: 1;
  }

  .guest-name {
    color: rgba(244, 245, 250, 0.6);
    font-size: 0.85em;
    margin-left: 0.8em;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kitsu-logo {
    height: 26px;
    width: auto;
  }

  .kitsu-logo-link {
    align-items: center;
    display: inline-flex;
    line-height: 0;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.75;
    }
  }

  .logout-button {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    color: rgba(244, 245, 250, 0.6);
    cursor: pointer;
    display: flex;
    margin-right: -0.6em;
    padding: 0.45em 0.55em;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.12);
      color: #f4f5fa;
    }
  }

  .playlist-button {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    color: rgba(244, 245, 250, 0.6);
    margin: 0 0.1em;
    padding: 0.35em 0.6em;
    transition: all 0.18s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.12);
      color: #f4f5fa;
    }
  }

  .playlist-name {
    color: #f4f5fa;
    font-size: 0.95em;
    font-weight: 600;
    margin: 0;
  }

  .project-name {
    color: rgba(244, 245, 250, 0.6);
    font-size: 0.78em;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

@media screen and (max-width: 768px) {
  .shared-header {
    .current-entity-name,
    .entity-nav,
    .guest-name,
    .header-separator,
    .project-name {
      display: none;
    }

    .playlist-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

@media screen and (max-width: 900px) and (orientation: landscape) {
  .shared-header {
    display: none;
  }
}
</style>
