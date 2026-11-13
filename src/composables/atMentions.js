import { computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'

// The departments are the ones of the current production, unless a getter of
// department ids is given.
export const useAtMentionsMembers = (
  teamGetter,
  taskTypesGetter,
  departmentIdsGetter = null
) => {
  const store = useStore()
  const departmentMap = computed(() => store.getters.departmentMap)
  const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
  const departmentIds = computed(() =>
    departmentIdsGetter
      ? departmentIdsGetter()
      : store.getters.productionDepartmentIds
  )

  const membersForAts = reactive({ '@': [], '#': [] })

  const atOptionsFilter = (name, chunk, at, v) => {
    const option_at = v?.isTaskType ? '#' : '@'
    if (at !== option_at) return false
    return name?.toLowerCase().indexOf(chunk.toLowerCase()) > -1
  }

  watch(
    taskTypesGetter,
    values => {
      const taskTypeOptions = values.map(taskType => ({
        isTaskType: true,
        full_name: taskType.name,
        color: taskType.color,
        id: taskType.id,
        url: taskType.url
      }))
      taskTypeOptions.push({
        isTaskType: true,
        isAll: true,
        color: '#000',
        full_name: 'All'
      })
      membersForAts['#'] = taskTypeOptions
    },
    { immediate: true }
  )

  watch(
    [teamGetter, departmentIds],
    ([teamValues]) => {
      let teamOptions
      if (isCurrentUserClient.value) {
        teamOptions = teamValues.filter(person =>
          ['admin', 'manager', 'client'].includes(person.role)
        )
      } else {
        teamOptions = [...teamValues]
      }
      if (!isCurrentUserClient.value) {
        teamOptions = teamOptions.concat(
          departmentIds.value
            .map(departmentId => departmentMap.value.get(departmentId))
            .filter(Boolean)
            .map(department => ({
              isDepartment: true,
              full_name: department.name,
              color: department.color,
              id: department.id
            }))
        )
      }
      teamOptions.push({
        isTime: true,
        at: '@',
        full_name: 'frame'
      })
      membersForAts['@'] = teamOptions
    },
    { immediate: true }
  )

  return { membersForAts, atOptionsFilter }
}
