/*
 * Board status helpers shared by the My Tasks and Person pages.
 * `productions` and `selectedProduction` are refs owned by the page:
 * the board columns come from the selected production, or from every
 * production of the list when none is selected.
 */
import { computed } from 'vue'
import { useStore } from 'vuex'

import { sortTaskStatuses } from '@/lib/sorting'

export const useBoardStatuses = (productions, selectedProduction) => {
  const store = useStore()

  const getProductionTaskStatuses = computed(
    () => store.getters.getProductionTaskStatuses
  )
  const taskStatuses = computed(() => store.getters.taskStatuses)
  const user = computed(() => store.getters.user)

  // Statuses visible on a production's board for the current user role.
  const getBoardStatusesByProduction = production => {
    const statuses = getProductionTaskStatuses
      .value(production.id)
      .filter(status => {
        if (status.for_concept) {
          return false
        }
        const rolesForBoard =
          production.task_statuses_link?.[status.id]?.roles_for_board
        return rolesForBoard?.includes(user.value.role)
      })
    return sortTaskStatuses(statuses, production)
  }

  const boardStatuses = computed(() => {
    if (selectedProduction.value) {
      return getBoardStatusesByProduction(selectedProduction.value)
    }

    const productionsByStatus = {}
    productions.value.forEach(production => {
      getBoardStatusesByProduction(production).forEach(status => {
        productionsByStatus[status.id] = (
          productionsByStatus[status.id] || []
        ).concat(production.id)
      })
    })

    return taskStatuses.value
      .filter(status => !status.for_concept)
      .map(status => ({
        ...status,
        productions: productionsByStatus[status.id] || []
      }))
      .filter(status => status.productions.length > 0)
      .sort((a, b) => a.priority - b.priority)
  })

  return { boardStatuses, getBoardStatusesByProduction }
}
