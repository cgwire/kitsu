// Type of the data carried while an available asset is dragged onto a line.
export const ASSET_DRAG_TYPE = 'application/x-kitsu-asset'

/*
 * Tells whether a cast asset is ready for a shot task type. Same rule as
 * zou (breakdown_service._is_asset_ready), which only stores the resulting
 * count on the tasks: the step the asset is delivered for (ready_for) must
 * come at or after the given one in the pipeline order of the production.
 * Assets shared from another production are always ready: the caller knows
 * them from the casting link, the assets of the store carry no project id.
 */
export const isAssetReadyFor = (asset, taskTypeId, getPriority) => {
  if (!asset || asset.canceled) return false
  // Empty shows as null, or as "None" in the compact assets stream of zou:
  // neither has a priority.
  const readyPriority = getPriority(asset.ready_for)
  if (!readyPriority) return false
  return (getPriority(taskTypeId) || 0) <= readyPriority
}
