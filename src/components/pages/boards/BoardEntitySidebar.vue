<template>
  <div class="board-entity-sidebar">
    <div class="sidebar-header">
      <h3>{{ $t('boards.entities') }}</h3>
      <div class="sidebar-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'shots' }"
          @click="activeTab = 'shots'"
        >
          {{ $t('shots.title') }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'assets' }"
          @click="activeTab = 'assets'"
        >
          {{ $t('assets.title') }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'concepts' }"
          @click="activeTab = 'concepts'"
        >
          {{ $t('concepts.title') }}
        </button>
      </div>
      <input
        type="text"
        class="search-input"
        :placeholder="$t('boards.search_placeholder')"
        v-model="searchText"
      />
    </div>
    <div class="entity-list">
      <div
        class="entity-item"
        :key="entity.id"
        draggable="true"
        @dragstart="onDragStart(entity, $event)"
        v-for="entity in filteredEntities"
      >
        <div class="entity-thumbnail">
          <img
            :src="`/api/pictures/thumbnails/preview-files/${entity.preview_file_id}.png`"
            v-if="entity.preview_file_id"
            @error="onThumbError"
          />
          <div class="no-preview" v-else>
            <image-icon :size="20" />
          </div>
        </div>
        <div class="entity-info">
          <span class="entity-name">{{ entity.name }}</span>
          <span class="entity-type">{{
            entity.sequence_name || entity.asset_type_name || ''
          }}</span>
        </div>
      </div>
      <div class="empty-list" v-if="!filteredEntities.length">
        {{ $t('boards.no_entities') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { ImageIcon } from 'lucide-vue-next'

export default {
  name: 'board-entity-sidebar',

  components: { ImageIcon },

  data() {
    return {
      activeTab: 'shots',
      searchText: ''
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'displayedShots',
      'displayedAssets',
      'concepts'
    ]),

    currentEntities() {
      switch (this.activeTab) {
        case 'shots':
          return this.displayedShots || []
        case 'assets':
          return this.displayedAssets || []
        case 'concepts':
          return this.concepts || []
        default:
          return []
      }
    },

    filteredEntities() {
      if (!this.searchText) return this.currentEntities
      const query = this.searchText.toLowerCase()
      return this.currentEntities.filter(
        e =>
          (e.name || '').toLowerCase().includes(query) ||
          (e.sequence_name || '').toLowerCase().includes(query) ||
          (e.asset_type_name || '').toLowerCase().includes(query)
      )
    }
  },

  methods: {
    onDragStart(entity, event) {
      const data = {
        id: entity.id,
        name: entity.name,
        type:
          this.activeTab === 'shots'
            ? 'Shot'
            : this.activeTab === 'assets'
              ? 'Asset'
              : 'Concept',
        preview_file_id: entity.preview_file_id,
        sequence_name: entity.sequence_name,
        asset_type_name: entity.asset_type_name
      }
      event.dataTransfer.setData('application/json', JSON.stringify(data))
      event.dataTransfer.effectAllowed = 'copy'
    },

    onThumbError(e) {
      e.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.board-entity-sidebar {
  width: 260px;
  margin-top: 20px;
  border-left: 1px solid var(--border, #eee);
  background: var(--background, #fff);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 100;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid var(--border, #eee);
}

.sidebar-header h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.sidebar-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.tab-btn {
  flex: 1;
  padding: 4px 8px;
  font-size: 11px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  background: var(--background, #fff);
  color: var(--text, #333);
  cursor: pointer;
}

.tab-btn.active {
  background: var(--background-selected, #dbeafe);
  border-color: var(--border-active, #3b82f6);
  color: var(--text-active, #1d4ed8);
}

.search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  font-size: 12px;
  background: var(--background, #fff);
  color: var(--text, #333);
}

.entity-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.entity-item {
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 4px;
  cursor: grab;
  gap: 8px;
  margin-bottom: 4px;
  transition: background 0.15s;
}

.entity-item:hover {
  background: var(--background-hover, #f5f5f5);
}

.entity-item:active {
  cursor: grabbing;
}

.entity-thumbnail {
  width: 48px;
  height: 36px;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--background-alt, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.entity-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-preview {
  color: var(--text-secondary, #999);
}

.entity-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.entity-name {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entity-type {
  font-size: 10px;
  color: var(--text-secondary, #999);
}

.empty-list {
  text-align: center;
  color: var(--text-secondary, #999);
  font-size: 12px;
  padding: 20px;
}
</style>
