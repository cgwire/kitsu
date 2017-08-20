export const sortAssets = (assets) => {
  return assets.sort((a, b) => {
    if (a.project_name !== b.project_name) {
      return a.project_name.localeCompare(b.project_name)
    } else if (a.asset_type_name !== b.asset_type_name) {
      return a.asset_type_name.localeCompare(b.asset_type_name)
    } else {
      return a.name.localeCompare(b.name)
    }
  })
}

export const sortShots = (shots) => {
  return shots.sort((a, b) => {
    if (a.project_name !== b.project_name) {
      return a.project_name.localeCompare(b.project_name)
    } else if (a.sequence_name !== b.sequence_name) {
      return a.sequence_name.localeCompare(b.sequence_name)
    } else {
      return a.name.localeCompare(b.name)
    }
  })
}

export const sortProductions = (productions) => {
  return productions.sort((a, b) => {
    if (a.project_status_name === b.project_status_name) {
      return a.name.localeCompare(b.name)
    } else {
      return -1 * a.project_status_name.localeCompare(b.project_status_name)
    }
  })
}

export const sortByName = (entries) => {
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}
