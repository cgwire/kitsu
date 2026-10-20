// SortableJS keeps the row pressed in a vuedraggable list, and vuedraggable
// the index the row had when its drag started: a reload that rebuilt the
// list in between made the drop move another row, or an undefined one, and
// a release without a drag report the row as moved. The rebuild waits for
// the release, and after a drop for the reload that follows the save, since
// a rebuild then would undo the drop before the save reads the list.
export const useDraggableRebuild = rebuild => {
  let isRowHeld = false
  let isRowDragged = false
  let isRebuildPending = false

  const rebuildUnlessHeld = () => {
    isRebuildPending = isRowHeld
    if (!isRowHeld) rebuild()
  }

  const onRowHeld = () => {
    isRowHeld = true
  }

  const onRowDragged = () => {
    isRowDragged = true
  }

  const onRowReleased = () => {
    isRowHeld = false
    if (isRebuildPending && !isRowDragged) rebuildUnlessHeld()
    isRowDragged = false
  }

  return {
    rebuild: rebuildUnlessHeld,
    onRowHeld,
    onRowDragged,
    onRowReleased
  }
}
