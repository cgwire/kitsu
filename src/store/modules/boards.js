import { v4 as uuidv4 } from 'uuid'

import boardsApi from '@/store/api/boards'

import {
  LOAD_BOARDS_START,
  LOAD_BOARDS_ERROR,
  LOAD_BOARDS_END,
  EDIT_BOARD_END,
  DELETE_BOARD_END,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  boards: [],
  currentBoard: null,
  isBoardsLoading: false,
  isBoardsLoadingError: false
}

const state = { ...initialState }

const getters = {
  boards: state => state.boards,
  currentBoard: state => state.currentBoard,
  isBoardsLoading: state => state.isBoardsLoading,
  isBoardsLoadingError: state => state.isBoardsLoadingError
}

const actions = {
  async loadBoards({ commit, rootGetters }) {
    commit(LOAD_BOARDS_START)
    try {
      const production = rootGetters.currentProduction
      const boards = await boardsApi.getBoards(production.id)
      commit(LOAD_BOARDS_END, { boards })
    } catch (err) {
      console.error(err)
      commit(LOAD_BOARDS_ERROR)
    }
  },

  async newBoard({ commit, rootGetters }, { name }) {
    const production = rootGetters.currentProduction
    const board = {
      id: uuidv4(),
      name: name || 'New Board',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      canvas_data: null
    }
    await boardsApi.createBoard(production.id, board)
    commit(EDIT_BOARD_END, board)
    return board
  },

  async saveBoard({ commit, rootGetters }, board) {
    const production = rootGetters.currentProduction
    board.updated_at = new Date().toISOString()
    await boardsApi.updateBoard(production.id, board)
    commit(EDIT_BOARD_END, board)
    return board
  },

  async deleteBoard({ commit, rootGetters }, boardId) {
    const production = rootGetters.currentProduction
    await boardsApi.deleteBoard(production.id, boardId)
    commit(DELETE_BOARD_END, boardId)
  },

  setCurrentBoard({ state }, board) {
    state.currentBoard = board
  }
}

const mutations = {
  [LOAD_BOARDS_START](state) {
    state.isBoardsLoading = true
    state.isBoardsLoadingError = false
  },

  [LOAD_BOARDS_ERROR](state) {
    state.isBoardsLoading = false
    state.isBoardsLoadingError = true
  },

  [LOAD_BOARDS_END](state, { boards }) {
    state.boards = boards
    state.isBoardsLoading = false
  },

  [EDIT_BOARD_END](state, board) {
    const idx = state.boards.findIndex(b => b.id === board.id)
    if (idx >= 0) {
      state.boards.splice(idx, 1, board)
    } else {
      state.boards.push(board)
    }
  },

  [DELETE_BOARD_END](state, boardId) {
    state.boards = state.boards.filter(b => b.id !== boardId)
    if (state.currentBoard && state.currentBoard.id === boardId) {
      state.currentBoard = null
    }
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState, boards: [], currentBoard: null })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
