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
