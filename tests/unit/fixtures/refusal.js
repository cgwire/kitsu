import { markRequestFailure } from '@/lib/errors'

// A save Zou refuses, marked as the API client marks the failed requests.
export const buildRefusal = (status = 400) => {
  const refusal = Object.assign(new Error('Refused'), { status })
  markRequestFailure(refusal)
  return refusal
}
