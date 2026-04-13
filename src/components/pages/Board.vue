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
              <img
                :src="board.thumbnail"
                class="board-thumb"
                v-if="board.thumbnail"
              />
              <layout-icon :size="32" v-else />
            </div>
            <div class="board-card-info">
              <div class="board-card-top">
                <span class="board-card-name">{{ board.name }}</span>
                <div class="board-card-actions">
                  <button
                    class="board-action-btn"
                    :title="board.visibility || 'private'"
                    @click.stop="cycleVisibility(board)"
                  >
                    <lock-icon
                      :size="12"
                      v-if="!board.visibility || board.visibility === 'private'"
                    />
                    <users-icon
                      :size="12"
                      v-else-if="board.visibility === 'team'"
                    />
                    <globe-icon :size="12" v-else />
                  </button>
                  <button
                    class="board-action-btn"
                    :class="{
                      'board-action-disabled':
                        !board.visibility || board.visibility === 'private'
                    }"
                    :title="
                      !board.visibility || board.visibility === 'private'
                        ? 'Share board first'
                        : 'Copy link'
                    "
                    @click.stop="
                      board.visibility && board.visibility !== 'private'
                        ? copyBoardLink(board)
                        : null
                    "
                  >
                    <link-icon :size="12" />
                  </button>
                  <button
                    class="board-action-btn board-action-danger"
                    title="Delete"
                    @click.stop="confirmDeleteBoardFromList(board)"
                  >
                    <trash2-icon :size="12" />
                  </button>
                </div>
              </div>
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

      <!-- Delete confirmation -->
      <div class="delete-overlay" v-if="deletingBoardId" @click="cancelDelete">
        <div class="delete-modal" @click.stop>
          <p>Delete this board? This cannot be undone.</p>
          <div class="delete-actions">
            <button class="delete-cancel" @click="cancelDelete">Cancel</button>
            <button
              class="delete-confirm"
              @click="doDeleteBoard(deletingBoardId)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" v-if="toast">{{ toast }}</div>

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
  GlobeIcon,
  LayoutIcon,
  LinkIcon,
  LockIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  UsersIcon
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
    GlobeIcon,
    LayoutIcon,
    LinkIcon,
    LockIcon,
    PlusIcon,
    SaveIcon,
    Trash2Icon,
    UsersIcon,
    TableInfo
  },

  data() {
    return {
      debounceSaveTimer: null,
      pendingThumbnail: null,
      toast: null,
      deletingBoardId: null,
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
        canvas_data: this.pendingCanvasData || this.currentBoard.canvas_data,
        thumbnail: this.pendingThumbnail || this.currentBoard.thumbnail
      }
      await this.saveBoard(board)
      this.pendingCanvasData = null
      this.pendingThumbnail = null
    },

    onCanvasChanged({ data, thumbnail }) {
      this.pendingCanvasData = data
      this.pendingThumbnail = thumbnail
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

    confirmDeleteBoardFromList(board) {
      this.deletingBoardId = board.id
    },

    async doDeleteBoard(boardId) {
      await this.deleteBoard(boardId)
      this.deletingBoardId = null
      this.showToast('Board deleted')
    },

    cancelDelete() {
      this.deletingBoardId = null
    },

    showToast(msg) {
      this.toast = msg
      setTimeout(() => {
        this.toast = null
      }, 2500)
    },

    exportBoard() {
      this.$refs.boardCanvas?.exportAsPNG()
    },

    copyBoardLink(board) {
      const url = `${window.location.origin}${this.$route.path}/${board.id}`
      navigator.clipboard
        .writeText(url)
        .then(() => this.showToast('Link copied!'))
        .catch(() => {
          const input = document.createElement('input')
          input.value = url
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          document.body.removeChild(input)
          this.showToast('Link copied!')
        })
    },

    async cycleVisibility(board) {
      const cycle = { private: 'team', team: 'public', public: 'private' }
      const current = board.visibility || 'private'
      const next = cycle[current]
      const updated = { ...board, visibility: next }
      await this.saveBoard(updated)
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
  color: #fff;
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
  overflow: hidden;
}

.board-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  color: var(--text-secondary, #ccc);
}

.board-card-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.board-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.board-card-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.board-card-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.board-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: #999;
  border-radius: 3px;
  cursor: pointer;
}

.board-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.board-action-disabled {
  opacity: 0.3;
  cursor: default;
  pointer-events: none;
}

.board-action-danger:hover {
  background: rgba(255, 0, 0, 0.15);
  color: #e53e3e;
}

.delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-modal {
  background: var(--background, #2a2a2a);
  border-radius: 10px;
  padding: 24px;
  min-width: 300px;
  text-align: center;
  color: #fff;
}

.delete-modal p {
  margin: 0 0 16px;
  font-size: 15px;
}

.delete-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.delete-cancel {
  padding: 8px 20px;
  border: 1px solid #555;
  border-radius: 6px;
  background: transparent;
  color: #ccc;
  cursor: pointer;
}

.delete-cancel:hover {
  background: #333;
}

.delete-confirm {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: #e53e3e;
  color: #fff;
  cursor: pointer;
}

.delete-confirm:hover {
  background: #c53030;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 13px;
  z-index: 600;
  pointer-events: none;
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
