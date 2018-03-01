
export const populateTask = (task) => {
  if (task.entity_type_name === 'Shot') {
    if (task.episode_name) {
      task.full_entity_name = `${task.episode_name} / ${task.sequence_name} / ${task.entity_name}`
    } else {
      task.full_entity_name = `${task.sequence_name} / ${task.entity_name}`
    }
    task.entity_path = {
      name: 'shot',
      params: {
        production_id: task.project_id,
        shot_id: task.entity_id
      }
    }
  } else {
    task.full_entity_name = `${task.entity_type_name} / ${task.entity_name}`
    task.entity_path = {
      name: 'asset',
      params: {
        production_id: task.project_id,
        asset_id: task.entity_id
      }
    }
  }
}

export const buildSelectionGrid = (maxX, maxY) => {
  const result = {}
  for (let i = 0; i < maxX; i++) {
    if (!result[i]) result[i] = {}
    for (let j = 0; j < maxY; j++) {
      result[i][j] = false
    }
  }
  return result
}

export const clearSelectionGrid = (selectionGrid) => {
  const maxX = Object.keys(selectionGrid).length
  const maxY = selectionGrid[0] ? Object.keys(selectionGrid[0]).length : 0
  for (let i = 0; i < maxX; i++) {
    for (let j = 0; j < maxY; j++) {
      if (selectionGrid[i][j]) selectionGrid[i][j] = false
    }
  }
  return selectionGrid
}
