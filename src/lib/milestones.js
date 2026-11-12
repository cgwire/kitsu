import { sortByName } from '@/lib/sorting'

// Values mirror the Zou milestone model choices.
export const MILESTONE_TYPES = [
  'kickoff',
  'review',
  'approval',
  'delivery',
  'other'
]

export const MILESTONE_TYPE_COLORS = {
  kickoff: '#42A5F5',
  review: '#F9A825',
  approval: '#AB47BC',
  delivery: '#33B378',
  other: '#78909C'
}

export const DEFAULT_MILESTONE_TYPE = 'other'

// A milestone without a picked color follows its type.
export const getMilestoneColor = milestone =>
  milestone.color || MILESTONE_TYPE_COLORS[milestone.milestone_type]

// Several milestones can share a day: the schedule header merges them.
export const groupMilestonesByDate = milestones => {
  const byDate = {}
  sortByName([...milestones]).forEach(milestone => {
    if (!byDate[milestone.date]) byDate[milestone.date] = []
    byDate[milestone.date].push(milestone)
  })
  return byDate
}
