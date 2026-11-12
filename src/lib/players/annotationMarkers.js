/*
 * Timeline marker helpers for movie annotations.
 *
 * Authors, hold ranges (an object's `holdFrames` keeps it visible on the
 * frames after its own) and the edits that move or hold the current user's
 * objects. Pure logic, no Vue / no canvas. The edits use the
 * `update-annotations` payload shape: Zou matches additions, updates and
 * deletions on the annotation time and the object id.
 */
import { roundToFrame } from '@/lib/video'

export const getObjectAuthorId = obj => obj?.createdBy || obj?.person_id || null

const getObjects = annotation => annotation?.drawing?.objects || []

export const getAnnotationAuthorIds = annotation => [
  ...new Set(getObjects(annotation).map(getObjectAuthorId).filter(Boolean))
]

export const getHoldFrames = obj =>
  Number.isInteger(obj?.holdFrames) && obj.holdFrames > 0 ? obj.holdFrames : 0

export const getAnnotationFrame = (annotation, frameDuration) =>
  Math.round((annotation?.time || 0) / frameDuration)

export const getAnnotationHoldEnd = (annotation, frameDuration) =>
  getAnnotationFrame(annotation, frameDuration) +
  Math.max(0, ...getObjects(annotation).map(getHoldFrames))

/*
 * Annotations of earlier frames reduced to the objects whose hold reaches
 * `frame`. The frame's own annotation is left out, as it is the editable
 * one, unless `includeStart` asks for its held objects too (the playback
 * clears the editable canvas).
 */
export const getHeldAnnotationsAtFrame = (
  annotations,
  frame,
  frameDuration,
  { includeStart = false } = {}
) =>
  (annotations || []).reduce((held, annotation) => {
    const start = getAnnotationFrame(annotation, frameDuration)
    if (start < frame || (includeStart && start === frame)) {
      const objects = getObjects(annotation).filter(obj => {
        const hold = getHoldFrames(obj)
        return hold > 0 && start + hold >= frame
      })
      if (objects.length) {
        held.push({
          ...annotation,
          drawing: { ...annotation.drawing, objects }
        })
      }
    }
    return held
  }, [])

const getOwnObjects = (annotation, userId) =>
  userId
    ? getObjects(annotation).filter(obj => getObjectAuthorId(obj) === userId)
    : []

export const hasOwnObjects = (annotation, userId) =>
  getOwnObjects(annotation, userId).length > 0

export const getOwnObjectHolds = (annotation, userId) =>
  Object.fromEntries(
    getOwnObjects(annotation, userId).map(obj => [obj.id, getHoldFrames(obj)])
  )

const getFrame = (annotation, fps) => Math.round((annotation.time || 0) * fps)

// The given objects (undo / redo replays a move on the objects it moved),
// else the user's own.
const selectObjects = (annotation, userId, ids) => {
  if (!ids) return getOwnObjects(annotation, userId)
  const wanted = new Set(ids)
  return getObjects(annotation).filter(obj => wanted.has(obj.id))
}

export const buildMoveEdits = ({ annotation, toFrame, fps, userId, ids }) => {
  if (!annotation) return null
  const objects = selectObjects(annotation, userId, ids)
  const frame = getFrame(annotation, fps)
  if (!objects.length || toFrame === frame || toFrame < 0) return null
  return {
    additions: [
      {
        time: roundToFrame(toFrame / fps, fps),
        frame: toFrame,
        drawing: { objects: objects.map(obj => ({ ...obj })) }
      }
    ],
    updates: [],
    deletions: [
      { time: annotation.time, frame, objects: objects.map(obj => obj.id) }
    ]
  }
}

// holdFrames: one hold for every object, or a hold per object id (undo).
export const buildHoldEdits = ({
  annotation,
  holdFrames,
  fps,
  userId,
  ids
}) => {
  if (!annotation) return null
  const isPerObject = typeof holdFrames === 'object' && holdFrames !== null
  const selectedIds = ids || (isPerObject ? Object.keys(holdFrames) : null)
  const objects = selectObjects(annotation, userId, selectedIds)
    .map(obj => {
      const value = isPerObject ? holdFrames[obj.id] : holdFrames
      return { obj, hold: Math.max(0, Math.round(value) || 0) }
    })
    .filter(({ obj, hold }) => getHoldFrames(obj) !== hold)
    .map(({ obj, hold }) => {
      const result = { ...obj, holdFrames: hold }
      if (!hold) delete result.holdFrames
      return result
    })
  if (!objects.length) return null
  return {
    additions: [],
    updates: [
      {
        time: annotation.time,
        frame: getFrame(annotation, fps),
        drawing: { objects }
      }
    ],
    deletions: []
  }
}

/*
 * Local mirror of what Zou does with the edits, so the player and the store
 * show the result before the save returns. The input list is not mutated.
 */
export const applyAnnotationEdits = (annotations, edits, fps) => {
  const halfFrame = 0.5 / fps
  let result = (annotations || []).map(annotation => ({
    ...annotation,
    drawing: { ...annotation.drawing, objects: [...getObjects(annotation)] }
  }))
  const findEntry = time =>
    result.find(annotation => Math.abs(annotation.time - time) < halfFrame)

  edits.additions.forEach(addition => {
    const entry = findEntry(addition.time)
    if (entry) {
      const ids = new Set(entry.drawing.objects.map(obj => obj.id))
      entry.drawing.objects.push(
        ...getObjects(addition).filter(obj => !ids.has(obj.id))
      )
    } else {
      result.push({
        ...addition,
        drawing: { objects: [...getObjects(addition)] }
      })
    }
  })
  edits.updates.forEach(update => {
    const entry = findEntry(update.time)
    if (entry) {
      const byId = new Map(getObjects(update).map(obj => [obj.id, obj]))
      entry.drawing.objects = entry.drawing.objects.map(
        obj => byId.get(obj.id) || obj
      )
    }
  })
  edits.deletions.forEach(deletion => {
    const entry = findEntry(deletion.time)
    if (entry) {
      const ids = new Set(deletion.objects)
      entry.drawing.objects = entry.drawing.objects.filter(
        obj => !ids.has(obj.id)
      )
    }
  })
  result = result.filter(annotation => annotation.drawing.objects.length > 0)
  return result
}
