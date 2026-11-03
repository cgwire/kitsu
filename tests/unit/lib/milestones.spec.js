import { getMilestoneColor, MILESTONE_TYPE_COLORS } from '@/lib/milestones'

describe('lib/milestones', () => {
  test('getMilestoneColor prefers the picked color, then the type', () => {
    expect(getMilestoneColor({ color: '#123456' })).toBe('#123456')
    expect(getMilestoneColor({ color: null, milestone_type: 'delivery' })).toBe(
      MILESTONE_TYPE_COLORS.delivery
    )
  })
})
