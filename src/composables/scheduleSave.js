import { computed, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCellSave } from '@/composables/cellSave'

// The dates and the estimation a bar has now.
export const getBarDates = bar => ({
  startDate: bar.startDate?.clone(),
  endDate: bar.endDate?.clone(),
  estimation: bar.estimation
})

// The dates and the estimation a bar had as a drag or an estimation change
// started, which the schedule widget stamped then. Copies: a later drag
// stamps again.
export const getBarOrigin = bar =>
  '_dragOrigStartDate' in bar
    ? {
        startDate: bar._dragOrigStartDate?.clone(),
        endDate: bar._dragOrigEndDate?.clone(),
        estimation: bar._dragOrigEstimation
      }
    : getBarDates(bar)

// Two states of a bar, of its dates, or of a field read alike.
const isSameState = (a, b) => {
  const comparable = state =>
    state?.startDate
      ? JSON.stringify({
          startDate: state.startDate.format('YYYY-MM-DD'),
          endDate: state.endDate?.format('YYYY-MM-DD'),
          estimation: state.estimation
        })
      : state
  return comparable(a) === comparable(b)
}

const setBarDates = (bar, { startDate, endDate, estimation }) => {
  bar.startDate = startDate
  bar.endDate = endDate
  // a row has no estimation of its own: its man-days sum those of its bars
  if (estimation === undefined) return
  bar.estimation = estimation
  // the man-days column of the row reads it
  if ('man_days' in bar) bar.man_days = estimation || 0
}

/*
 * Saves the bars of a schedule as useCellSave saves the cells of a list: a
 * bar whose change Zou refuses goes back to the dates it had before, and
 * scheduleSaveErrorText says so until a later save goes through. The page
 * redraws the bar.
 *
 * getName(bar): the name the bar shows, for the message. A bar can name the
 * entity of its task, which may outlive a task deleted meanwhile: a 404
 * reads as any refusal.
 */
export const useScheduleSave = getName => {
  const { t } = useI18n()
  const dates = useCellSave(getName, { rowsAreTasks: true })
  // Apart from the dates: the drop that ends a reassigning drag saves them,
  // which would clear the refusal of a reassignment.
  const assignments = useCellSave(getName, { rowsAreTasks: true })

  // The saves of one thing can overlap: an estimation typed key by key, a
  // drag before the answer to the previous one, a row two moved bars widen,
  // a date picked twice. Once the last one settles, the thing shows the
  // state of the last change Zou took, or the one it had before them all.
  const trackedSaves = new WeakMap()
  // What a put back left: the answer often comes during the next drag,
  // which the widget stamped from the refused state, while Zou holds the
  // state put back.
  const refusals = new WeakMap()

  // Returns whether the save went through. key: an object that stands for
  // the thing saved; entry: what the message names; origin: its state before
  // the change; sent: the state the save sends; putBack(state): shows the
  // state Zou holds.
  const saveTracked = async (key, entry, { origin, sent, save, putBack }) => {
    if (!trackedSaves.has(key)) {
      const refusal = refusals.get(key)
      refusals.delete(key)
      const state =
        refusal && isSameState(refusal.refused, origin) ? refusal.held : origin
      trackedSaves.set(key, {
        nbSaves: 0,
        nbPending: 0,
        bugIndex: 0,
        kept: { index: 0, state }
      })
    }
    const saves = trackedSaves.get(key)
    saves.nbSaves += 1
    saves.nbPending += 1
    saves.lastSent = sent
    const index = saves.nbSaves
    let isSaved = false
    try {
      isSaved = await dates.saveCell(entry, save)
    } catch (err) {
      saves.bugIndex = Math.max(saves.bugIndex, index)
      throw err
    } finally {
      saves.nbPending -= 1
      if (isSaved && index > saves.kept.index) {
        saves.kept = { index, state: sent }
      }
      // a bug after the last change Zou took leaves the state unknown:
      // Sentry has it
      const isKnown = saves.bugIndex <= saves.kept.index
      if (saves.nbPending === 0) {
        trackedSaves.delete(key)
        if (saves.kept.index !== saves.nbSaves && isKnown) {
          refusals.set(key, { refused: saves.lastSent, held: saves.kept.state })
          putBack(saves.kept.state)
        }
      }
    }
    return isSaved
  }

  // Returns whether the save went through. origin: the dates the bar had
  // before the change, by default those the widget stamped; it goes back
  // there unless Zou holds others. onPutBack(bar) redraws it.
  const saveBar = (bar, save, { origin = getBarOrigin(bar), onPutBack } = {}) =>
    saveTracked(toRaw(bar), bar, {
      origin,
      sent: getBarDates(bar),
      save,
      putBack: dates => {
        setBarDates(bar, dates)
        onPutBack?.(bar)
      }
    })

  // A change that has nothing to put back, such as the dates of a task
  // dropped from the backlog. Returns whether the save went through.
  const saveChange = (entry, save) => dates.saveCell(entry, save)

  // Returns whether the save went through: the page puts the rows back.
  const saveAssignment = (task, save) => assignments.saveCell(task, save)

  const scheduleSaveErrorText = computed(() => {
    const texts = [
      assignments.cellSaveErrorText.value,
      dates.cellSaveErrorText.value
    ].filter(Boolean)
    return texts.length > 1 ? t('main.cells_save_error') : texts[0] || ''
  })

  return {
    groupSaves: dates.groupSaves,
    saveAssignment,
    saveBar,
    saveChange,
    saveTracked,
    scheduleSaveErrorText
  }
}
