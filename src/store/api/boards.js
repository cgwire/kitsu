/*
 * Board API - stores boards in localStorage per production.
 * Future: migrate to Zou custom data or a dedicated endpoint.
 */

const STORAGE_KEY = 'kitsu:boards'

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export default {
  getBoards(productionId) {
    const all = getAll()
    return Promise.resolve(all[productionId] || [])
  },

  getBoard(productionId, boardId) {
    const all = getAll()
    const boards = all[productionId] || []
    return Promise.resolve(boards.find(b => b.id === boardId) || null)
  },

  createBoard(productionId, board) {
    const all = getAll()
    if (!all[productionId]) all[productionId] = []
    all[productionId].push(board)
    saveAll(all)
    return Promise.resolve(board)
  },

  updateBoard(productionId, board) {
    const all = getAll()
    const boards = all[productionId] || []
    const idx = boards.findIndex(b => b.id === board.id)
    if (idx >= 0) {
      boards[idx] = board
    } else {
      boards.push(board)
    }
    all[productionId] = boards
    saveAll(all)
    return Promise.resolve(board)
  },

  deleteBoard(productionId, boardId) {
    const all = getAll()
    const boards = all[productionId] || []
    all[productionId] = boards.filter(b => b.id !== boardId)
    saveAll(all)
    return Promise.resolve()
  }
}
