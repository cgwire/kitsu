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
 * URL path changes. The store has put the former value back. Anything but a
 * refused request is a bug, left unhandled for Sentry.
 *
 * getName(entry): the name the row shows, for the message.
 */
export const useCellSave = (getName = getEntityName) => {
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
        isDeleted: isNotFound(err),
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

  // A page stays mounted when the topbar changes production or episode: the
  // refusals are about rows it no longer shows.
  watch(
    () => route.path,
    () => {
      refusedCellSaves.value = []
    }
  )

  return { cellSaveErrorText, saveCell }
}
