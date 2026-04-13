<template>
  <div class="fixed-page columns">
    <div class="column main-column board-page">
      <div class="page-header board-header">
        <div class="header-left">
          <div class="board-list-section" v-if="!currentBoard">
            <h2 class="board-title">{{ $t('boards.title') }}</h2>
          </div>
          <div class="board-nav" v-else>
            <button class="back-btn" @click="goBackToList">
              <arrow-left-icon :size="16" />
              {{ $t('boards.title') }}
            </button>
            <span class="board-name-display" v-if="!isEditingName">
              {{ currentBoard.name }}
              <button class="edit-name-btn" @click="startEditName">
                <edit2-icon :size="14" />
              </button>
            </span>
            <input
              type="text"
              class="board-name-input"
              ref="nameInput"
              v-model="editingName"
              @keydown.enter="saveEditName"
              @blur="saveEditName"
              v-else
            />
          </div>
        </div>
        <div class="header-right">
          <button class="header-btn" @click="createBoard" v-if="!currentBoard">
            <plus-icon :size="16" />
            {{ $t('boards.new_board') }}
          </button>
          <template v-if="currentBoard">
            <button class="header-btn" @click="saveCurrentBoard">
              <save-icon :size="16" />
              {{ $t('main.save') }}
            </button>
            <button class="header-btn" @click="exportBoard">
              <download-icon :size="16" />
              {{ $t('boards.export') }}
            </button>
            <button class="header-btn danger" @click="confirmDeleteBoard">
              <trash2-icon :size="16" />
            </button>
          </template>
        </div>
      </div>

      <!-- Board List -->
      <div class="board-list" v-if="!currentBoard">
        <table-info
          :is-loading="isBoardsLoading"
          :is-error="isBoardsLoadingError"
          v-if="isBoardsLoading || isBoardsLoadingError"
        />
        <div class="board-grid" v-else-if="boards.length">
          <div
            class="board-card"
            :key="board.id"
            @click="openBoard(board)"
            v-for="board in boards"
          >
            <div class="board-card-preview">
              <layout-icon :size="32" />
            </div>
            <div class="board-card-info">
              <span class="board-card-name">{{ board.name }}</span>
              <span class="board-card-date">
                {{ formatDate(board.updated_at) }}
              </span>
            </div>
          </div>
        </div>
        <div class="empty-boards" v-else>
          <layout-icon :size="48" />
          <p>{{ $t('boards.empty') }}</p>
          <button class="header-btn" @click="createBoard">
            <plus-icon :size="16" />
            {{ $t('boards.new_board') }}
          </button>
        </div>
      </div>

      <!-- Board Canvas -->
      <board-canvas
        ref="boardCanvas"
        :board="currentBoard"
        :entities="allEntities"
        @canvas-changed="onCanvasChanged"
        v-if="currentBoard"
      />
    </div>

    <board-entity-sidebar v-if="currentBoard" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

import { domMixin } from '@/components/mixins/dom'

import BoardCanvas from '@/components/pages/boards/BoardCanvas.vue'
import BoardEntitySidebar from '@/components/pages/boards/BoardEntitySidebar.vue'
import {
  ArrowLeftIcon,
  DownloadIcon,
  Edit2Icon,
  LayoutIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon
} from 'lucide-vue-next'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'boards',

  mixins: [domMixin],

  components: {
    ArrowLeftIcon,
    BoardCanvas,
    BoardEntitySidebar,
    DownloadIcon,
    Edit2Icon,
    LayoutIcon,
    PlusIcon,
    SaveIcon,
    Trash2Icon,
    TableInfo
  },

  data() {
    return {
      debounceSaveTimer: null,
      isEditingName: false,
      editingName: '',
      pendingCanvasData: null,
      autoSaveTimer: null
    }
  },

  mounted() {
    this.loadBoards()
    this.loadShots({ production: this.currentProduction })
    this.loadAssets({ production: this.currentProduction })

    // Auto-save every 30 seconds
    this.autoSaveTimer = setInterval(() => {
      if (this.currentBoard && this.pendingCanvasData) {
        this.saveCurrentBoard()
      }
    }, 30000)
  },

  beforeUnmount() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }
    if (this.debounceSaveTimer) {
      clearTimeout(this.debounceSaveTimer)
    }
    // Save before leaving
    if (this.currentBoard && this.pendingCanvasData) {
      this.saveCurrentBoard()
    }
  },

  computed: {
    ...mapGetters([
      'boards',
      'currentBoard',
      'currentProduction',
      'displayedShots',
      'displayedAssets',
      'isBoardsLoading',
      'isBoardsLoadingError'
    ]),

    allEntities() {
      return [...(this.displayedShots || []), ...(this.displayedAssets || [])]
    }
  },

  methods: {
    ...mapActions([
      'deleteBoard',
      'loadAssets',
      'loadBoards',
      'loadShots',
      'newBoard',
      'saveBoard',
      'setCurrentBoard'
    ]),

    formatDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm')
    },

    async createBoard() {
      const board = await this.newBoard({ name: 'New Board' })
      this.setCurrentBoard(board)
    },

    openBoard(board) {
      this.setCurrentBoard(board)
    },

    goBackToList() {
      if (this.pendingCanvasData) {
        this.saveCurrentBoard()
      }
      this.setCurrentBoard(null)
    },

    async saveCurrentBoard() {
      if (!this.currentBoard) return
      const board = {
        ...this.currentBoard,
        canvas_data: this.pendingCanvasData || this.currentBoard.canvas_data
      }
      await this.saveBoard(board)
      this.pendingCanvasData = null
    },

    onCanvasChanged(canvasData) {
      this.pendingCanvasData = canvasData
      // Debounced auto-save on every change
      if (this.debounceSaveTimer) clearTimeout(this.debounceSaveTimer)
      this.debounceSaveTimer = setTimeout(() => {
        this.saveCurrentBoard()
      }, 2000)
    },

    startEditName() {
      this.editingName = this.currentBoard.name
      this.isEditingName = true
      this.$nextTick(() => {
        this.$refs.nameInput?.focus()
        this.$refs.nameInput?.select()
      })
    },

    async saveEditName() {
      if (!this.editingName.trim()) {
        this.isEditingName = false
        return
      }
      const board = { ...this.currentBoard, name: this.editingName.trim() }
      await this.saveBoard(board)
      this.setCurrentBoard(board)
      this.isEditingName = false
    },

    async confirmDeleteBoard() {
      if (!confirm(this.$t('boards.delete_confirm'))) return
      const boardId = this.currentBoard.id
      this.setCurrentBoard(null)
      await this.deleteBoard(boardId)
    },

    exportBoard() {
      this.$refs.boardCanvas?.exportAsPNG()
    }
  }
}
</script>

<style scoped>
.board-page {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 100;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  margin-top: 60px;
  border-bottom: 1px solid var(--border, #eee);
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.board-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.board-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  background: transparent;
  color: var(--text, #333);
  cursor: pointer;
  font-size: 13px;
}

.back-btn:hover {
  background: var(--background-hover, #f5f5f5);
}

.board-name-display {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-name-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary, #999);
  cursor: pointer;
  padding: 2px;
}

.edit-name-btn:hover {
  color: var(--text, #333);
}

.board-name-input {
  font-size: 16px;
  font-weight: 500;
  padding: 2px 8px;
  border: 1px solid var(--border-active, #3b82f6);
  border-radius: 4px;
  outline: none;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  background: var(--background, #fff);
  color: var(--text, #333);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.header-btn:hover {
  background: var(--background-hover, #f5f5f5);
}

.header-btn.danger {
  color: #e53e3e;
  border-color: #feb2b2;
}

.header-btn.danger:hover {
  background: #fff5f5;
}

/* Board List */
.board-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.board-card {
  border: 1px solid var(--border, #eee);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--background, #fff);
}

.board-card:hover {
  border-color: var(--border-active, #3b82f6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.board-card-preview {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-alt, #f9f9f9);
  color: var(--text-secondary, #ccc);
}

.board-card-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.board-card-name {
  font-size: 14px;
  font-weight: 500;
}

.board-card-date {
  font-size: 11px;
  color: var(--text-secondary, #999);
}

.empty-boards {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-secondary, #999);
}

.empty-boards p {
  margin: 0;
  font-size: 14px;
}
</style>
