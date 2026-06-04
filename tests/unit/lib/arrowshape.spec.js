import { Arrow } from '@/lib/players/arrowshape'

describe('lib/players/arrowshape', () => {
  it('exposes a static type so Fabric v6 toObject serializes it as "arrow"', () => {
    // Arrow extends fabric.Line; without its own static type, v6's
    // toObject() would read Line's static type and serialize it as "line".
    expect(Arrow.type).toBe('arrow')
  })
})
