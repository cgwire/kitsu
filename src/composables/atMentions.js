import { computed, onBeforeUnmount, reactive, watch } from 'vue'
import { useStore } from 'vuex'

export const useAtMentionsMembers = (
  teamGetter,
  taskTypesGetter,
  departmentIdsGetter
) => {
  const store = useStore()
  const departmentMap = computed(() => store.getters.departmentMap)
  const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
  const departmentIds = computed(departmentIdsGetter)

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
  // the field, such as a modal or a player: that focus keeps the list, not
  // one a key gives to the container. The window gets a key before the
  // document, where the players listen.
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

  // vue-at picks its highlighted entry on key code 13, whatever the modifiers.
  // The document gets the key before the field: the list closes on Ctrl+Enter
  // or Cmd+Enter, and the text stays as typed. vue-at also reads the field
  // again 50 ms after a keystroke, later on a busy page: the list stays closed
  // until the next input in the field.
  let isClosedUntilInput = false

  const onDocumentKeydown = event => {
    if (
      event.keyCode === 13 &&
      (event.ctrlKey || event.metaKey) &&
      isInField(event)
    ) {
      isClosedUntilInput = true
      closeSuggestions()
    }
  }

  const onDocumentInput = event => {
    if (isInField(event)) {
      isClosedUntilInput = false
    }
  }

  const listen = method => {
    document[method]('pointerdown', onDocumentPress, true)
    document[method]('focusin', onDocumentFocus, true)
    document[method]('keydown', onDocumentKeydown, true)
    document[method]('input', onDocumentInput, true)
    window[method]('keydown', onWindowKeydown, true)
  }

  watch(
    membersGetter,
    values => {
      members.splice(0, members.length, ...values)
    },
    { immediate: true }
  )

  watch(
    () => atRef.value?.atwho,
    atwho => {
      if (atwho && isClosedUntilInput) {
        closeSuggestions()
      }
    }
  )

  // A list of comments holds one field per comment: only a rendered field
  // listens.
  watch(
    () => Boolean(atRef.value),
    isShown => {
      listen(isShown ? 'addEventListener' : 'removeEventListener')
    }
  )

  onBeforeUnmount(() => {
    listen('removeEventListener')
  })

  return { members, closeSuggestions }
}
