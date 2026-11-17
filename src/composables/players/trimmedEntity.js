import { computed, toRaw } from 'vue'

// The entity types the preview player trims, with the getter of their cached
// list and the action saving them.
const TRIMMED_ENTITY_STORES = {
  Asset: { action: 'editAsset', mapGetter: 'assetMap' },
  Shot: { action: 'editShot', mapGetter: 'shotMap' }
}

/*
 * The shot or asset whose trim handles the preview player edits: the cached
 * entity when its list is loaded, else the entity of the task payload.
 */
export const useTrimmedEntity = ({ entityType, store, task }) => {
  // The store refreshes cached entities only: keep the data saved for a task
  // payload's entity until a reload brings a new payload.
  const savedData = new WeakMap()

  const canEditTrim = computed(() => store.getters.canEditTrim(task.value))

  // Not every parent passes entity-type (the Task page doesn't): derive the
  // type from the task too. The entity type of an asset task is its asset
  // type (Character, Prop...), so the task type tells assets apart.
  const getEntityStore = () => {
    const type =
      entityType.value ||
      store.getters.taskTypeMap?.get(task.value?.task_type_id)?.for_entity ||
      task.value?.entity_type?.name ||
      task.value?.entity_type_name
    return TRIMMED_ENTITY_STORES[type] || null
  }

  // A plain function, not a computed: the entity map getters expose a
  // non-reactive cache, so it must be re-read at call time.
  const getTrimmedEntity = () => {
    const entityStore = getEntityStore()
    if (!entityStore) return null
    const cachedEntity = store.getters[entityStore.mapGetter]?.get(
      task.value?.entity_id
    )
    if (cachedEntity) return cachedEntity
    const entity = task.value?.entity
    const data = entity && savedData.get(toRaw(entity))
    return data ? { ...entity, data } : entity
  }

  const saveTrimmedEntity = handles => {
    const entityStore = getEntityStore()
    const trimmedEntity = getTrimmedEntity()
    if (!trimmedEntity?.id) return Promise.resolve()
    const data = { ...trimmedEntity.data, ...handles }
    const isCached = Boolean(
      store.getters[entityStore.mapGetter]?.has(trimmedEntity.id)
    )
    const entity = isCached ? null : toRaw(task.value.entity)
    const previousData = entity && savedData.get(entity)
    if (entity) savedData.set(entity, data)
    return store
      .dispatch(entityStore.action, { id: trimmedEntity.id, data })
      .catch(err => {
        // The store puts a cached entity back itself: only the payload memory
        // of an entity out of its cache is ours to roll back, and only while
        // this save is still its latest write.
        if (entity && savedData.get(entity) === data) {
          if (previousData) {
            savedData.set(entity, previousData)
          } else {
            savedData.delete(entity)
          }
        }
        throw err
      })
  }

  return { canEditTrim, getTrimmedEntity, saveTrimmedEntity }
}
