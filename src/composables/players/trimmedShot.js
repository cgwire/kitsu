import { toRaw } from 'vue'

/*
 * The shot whose trim handles the preview player edits: the cached shot when
 * the shots list is loaded, else the shot of the task payload.
 */
export const useTrimmedShot = ({ entityType, store, task }) => {
  // The store refreshes cached shots only: keep the data saved for a task
  // payload's shot until a reload brings a new payload.
  const savedData = new WeakMap()

  // Not every parent passes entity-type (the Task page doesn't): derive the
  // type from the task payload too. A plain function, not a computed: the
  // shotMap getter exposes a non-reactive cache, so it must be re-read at
  // call time.
  const getTrimmedShot = () => {
    const type =
      entityType.value ||
      task.value?.entity_type?.name ||
      task.value?.entity_type_name
    if (type !== 'Shot') return null
    const shot = store.getters.shotMap?.get(task.value?.entity_id)
    if (shot) return shot
    const entity = task.value?.entity
    const data = entity && savedData.get(toRaw(entity))
    return data ? { ...entity, data } : entity
  }

  const saveTrimmedShot = handles => {
    const shot = getTrimmedShot()
    if (!shot?.id) return
    const data = { ...shot.data, ...handles }
    store.dispatch('editShot', { id: shot.id, data })
    if (!store.getters.shotMap?.has(shot.id)) {
      savedData.set(toRaw(task.value.entity), data)
    }
  }

  return { getTrimmedShot, saveTrimmedShot }
}
