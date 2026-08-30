/* Cost of a person for a given month (YYYY-MM key or moment): an explicit
 * salary exception wins over the computed month cost.
 */
export const getMonthCost = (personEntry, month) => {
  const monthKey = typeof month === 'string' ? month : month.format('YYYY-MM')
  return (
    parseInt(personEntry.exceptions?.[monthKey]) ||
    parseInt(personEntry.monthCosts[monthKey]) ||
    0
  )
}
