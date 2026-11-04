import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { isNotFound, logRequestFailure } from '@/lib/errors'

// The name its row shows an entity under, with its asset type or its
// sequence.
export const getEntityName = entity =>
  entity.full_name ||
  [entity.sequence_name, entity.name].filter(Boolean).join(' / ')

/*
 * Saves the cells of the rows of a list, which have no modal to tell a
 * refusal: cellSaveErrorText does, until a later change goes through or the
 * list moves to another URL path, production, or episode. The store has put
 * the former value back. Anything but a refused request is a bug, left
 * unhandled for Sentry.
 *
 * getName(entry): the name the row shows, for the message.
 * rowsAreTasks: a row names the entity of its task, which may outlive a task
 * deleted meanwhile, so a 404 reads as any refusal.
 */
export const useCellSave = (
  getName = getEntityName,
  { rowsAreTasks = false } = {}
) => {
  const { t } = useI18n()
  const route = useRoute()

  // The rows whose cell save Zou refused, as { id, name, isDeleted, change }.
  const refusedCellSaves = ref([])
  // The rows of a selection save together and settle in any order: they make
  // one change, over once all its saves settled.
  let change = 0
  let nbPendingSaves = 0

  const cellSaveErrorText = computed(() => {
    const refusals = refusedCellSaves.value
    if (refusals.length > 1) return t('main.cells_save_error')
    if (refusals.length === 0) return ''
    const [{ name, isDeleted }] = refusals
    return isDeleted
      ? t('main.edit_deleted_error', { name })
      : t('main.cell_save_error', { name })
  })

  // Returns whether the save went through.
  const saveCell = async (entry, save) => {
    if (nbPendingSaves === 0) change += 1
    const saveChange = change
    nbPendingSaves += 1
    try {
      await save()
    } catch (err) {
      logRequestFailure(err)
      const refusal = {
        id: entry.id,
        name: getName(entry),
        isDeleted: !rowsAreTasks && isNotFound(err),
        change: saveChange
      }
      refusedCellSaves.value = [
        ...refusedCellSaves.value.filter(({ id }) => id !== entry.id),
        refusal
      ]
      return false
    } finally {
      nbPendingSaves -= 1
    }
    // Within its change, a save only answers for its own row.
    refusedCellSaves.value = refusedCellSaves.value.filter(
      refusal => refusal.change === saveChange && refusal.id !== entry.id
    )
    return true
  }

  // A change of production or episode keeps the list mounted: the topbar
  // keeps the page, and on Person and My Checks it only writes the query. The
  // message is about the former list, even when one of its rows stays shown.
  watch(
    [
      () => route.path,
      () => route.query.productionId,
      () => route.query.project_id,
      () => route.query.episode_id
    ],
    () => {
      refusedCellSaves.value = []
    }
  )

  return { cellSaveErrorText, saveCell }
}
