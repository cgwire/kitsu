// A page opens the search filter modal through a ref on its list of searches:
// the stub records the searches it gets.
export const buildSearchQueryListStub = () => ({
  name: 'SearchQueryList',
  props: { entityType: { type: String, default: null } },
  template: '<div />',
  methods: { addSearch: vi.fn() }
})
