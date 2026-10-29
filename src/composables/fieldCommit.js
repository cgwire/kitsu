import { onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

/*
 * A field keeps its focus through a history move (the Back keys, the back
 * button of a mouse, a swipe): the page shows another record or goes away
 * before the field fires its change, so a typed value was saved on the next
 * record, or on none. Blurring the field before the move saves it where it
 * was typed, as a click elsewhere does.
 *
 * container: template ref of the page.
 * isOtherRecord(to, from): whether the move leaves the record of the page.
 */
export const useFieldCommitOnLeave = (container, isOtherRecord) => {
  const router = useRouter()
  // One global guard sees both moves, to another record shown by the same
  // page and away from the page, wherever the page is rendered.
  const removeGuard = router.beforeEach((to, from) => {
    const field = document.activeElement
    if (isOtherRecord(to, from) && container.value?.contains(field)) {
      field.blur()
    }
  })
  onBeforeUnmount(removeGuard)
}
