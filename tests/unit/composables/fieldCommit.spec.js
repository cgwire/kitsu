import { mount } from '@vue/test-utils'
import { useTemplateRef } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useFieldCommitOnLeave } from '@/composables/fieldCommit'

const Page = {
  setup() {
    useFieldCommitOnLeave(
      useTemplateRef('page'),
      (to, from) => to.params.id !== from.params.id
    )
  },
  template: '<div ref="page"><input class="field" /></div>'
}

const routes = [
  { path: '/records/:id', component: { template: '<div />' } },
  { path: '/elsewhere', component: { template: '<div />' } }
]

describe('useFieldCommitOnLeave', () => {
  let router
  let wrapper
  let outside

  // The route each blur of the field happened on.
  const blurRoutes = []

  beforeEach(async () => {
    router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/records/1')
    wrapper = mount(Page, {
      attachTo: document.body,
      global: { plugins: [router] }
    })
    blurRoutes.length = 0
    wrapper
      .find('.field')
      .element.addEventListener('blur', () =>
        blurRoutes.push(router.currentRoute.value.fullPath)
      )
    outside = document.createElement('input')
    document.body.appendChild(outside)
  })

  afterEach(() => {
    wrapper?.unmount()
    outside.remove()
  })

  const focusField = () => wrapper.find('.field').element.focus()

  // The change a browser fires on blur then saves on the record shown.
  it('blurs the field before the page shows another record', async () => {
    focusField()

    await router.push('/records/2')

    expect(blurRoutes).toEqual(['/records/1'])
  })

  it('blurs the field before the page goes away', async () => {
    focusField()

    await router.push('/elsewhere')

    expect(blurRoutes).toEqual(['/records/1'])
  })

  it('keeps the focus through a move on the same record', async () => {
    focusField()

    await router.push('/records/1?tab=video')

    expect(blurRoutes).toEqual([])
    expect(document.activeElement).toBe(wrapper.find('.field').element)
  })

  it('leaves the focus of a field out of the page', async () => {
    outside.focus()

    await router.push('/records/2')

    expect(document.activeElement).toBe(outside)
  })

  it('removes its guard with the page', async () => {
    const removeGuard = vi.fn()
    const otherRouter = createRouter({ history: createMemoryHistory(), routes })
    await otherRouter.push('/records/1')
    vi.spyOn(otherRouter, 'beforeEach').mockReturnValue(removeGuard)
    const page = mount(Page, { global: { plugins: [otherRouter] } })

    page.unmount()

    expect(removeGuard).toHaveBeenCalledTimes(1)
  })
})
