// Whole amounts grouped by thousands. The grouping follows the clock
// preference rather than the UI language: an English UI does not make its
// reader American. 12-hour clock: "1,200"; 24-hour clock: "1 200" (ISO
// grouping, narrow no-break space).
export const formatAmount = (value, use12HourClock = false) =>
  Math.round(value).toLocaleString(use12HourClock ? 'en-US' : 'fr-FR')

// True when the text of a number input reads as value, as v-model checks
// before writing a value back: the text typed then stays ("2.0" for 2). An
// empty text reads as an empty value, a leading zero ("05") does not count.
export const isNumberTyped = (input, value) => {
  const typed = Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber
  const number = value === '' || value == null ? null : Number(value)
  return !/^0\d/.test(input.value) && typed === number
}
