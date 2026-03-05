import { computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'

export function useAtMentionsMembers(teamGetter, taskTypesGetter) {
  const store = useStore()
  const departmentMap = computed(() => store.getters.departmentMap)
  const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
  const productionDepartmentIds = computed(
    () => store.getters.productionDepartmentIds
  )

  const membersForAts = reactive({ '@': [], '#': [] })

  function atOptionsFilter(name, chunk, at, v) {
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
        color: '#000',
        full_name: 'All'
      })
      membersForAts['#'] = taskTypeOptions
    },
    { deep: true, immediate: true }
  )

  watch(
    teamGetter,
    teamValues => {
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
          productionDepartmentIds.value.map(departmentId => {
            const department = departmentMap.value.get(departmentId)
            return {
              isDepartment: true,
              full_name: department.name,
              color: department.color,
              id: departmentId
            }
          })
        )
      }
      teamOptions.push({
        isTime: true,
        at: '@',
        full_name: 'frame'
      })
      membersForAts['@'] = teamOptions
    },
    { deep: true, immediate: true }
  )

  return { membersForAts, atOptionsFilter }
}
