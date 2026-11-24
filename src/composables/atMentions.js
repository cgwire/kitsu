import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
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

// vue-at leaves its list open once the field loses the focus, and reopens it
// at each new array of members, even with the focus elsewhere: the members
// stay in one array, refreshed in place. A press or a focus outside the field
// closes the list, but for the focus a press on the list gives to a container
// of the field.
export const useAtSuggestions = (atRef, membersGetter) => {
  const members = []

  const closeSuggestions = () => {
    atRef.value?.closePanel()
  }

  const isInField = event => Boolean(atRef.value?.$el.contains(event.target))

  // A press on the list moves the focus to the closest focusable container of
  // the field, such as a player: that focus keeps the list, not one a key
  // gives to the container. The window gets a key before the document, where
  // the players listen.
  let isPressOnList = false

  const isAroundField = event =>
    Boolean(atRef.value && event.target.contains(atRef.value.$el))

  const onDocumentPress = event => {
    isPressOnList =
      isInField(event) && Boolean(event.target.closest('.atwho-panel'))
    if (!isInField(event)) {
      closeSuggestions()
    }
  }

  const onDocumentFocus = event => {
    const isKept = isInField(event) || (isPressOnList && isAroundField(event))
    isPressOnList = false
    if (!isKept) {
      closeSuggestions()
    }
  }

  const onWindowKeydown = () => {
    isPressOnList = false
  }

  watch(
    membersGetter,
    values => {
      members.splice(0, members.length, ...values)
    },
    { immediate: true }
  )

  onMounted(() => {
    document.addEventListener('pointerdown', onDocumentPress, true)
    document.addEventListener('focusin', onDocumentFocus, true)
    window.addEventListener('keydown', onWindowKeydown, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPress, true)
    document.removeEventListener('focusin', onDocumentFocus, true)
    window.removeEventListener('keydown', onWindowKeydown, true)
  })

  return { members, closeSuggestions }
}
