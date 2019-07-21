import {
  getDayRange,
  getMonthRange,
  getWeekRange
} from './helpers'

const csv = {
  generateTimesheet (
    name,
    timesheet,
    people,
    detailLevel,
    year,
    month,
    currentYear,
    currentMonth,
    currentWeek
  ) {
    const headers = csv.getTimesheetHeaders()
    const entries = csv.getTimesheetEntries(headers, people, timesheet)
    csv.buildCsvFile(name, entries)
  },

  getTimesheetHeaders (
    detailLevel,
    year,
    month,
    currentYear,
    currentMonth,
    currentWeek
  ) {
    const headers = ['Person']
    let range = []
    if (detailLevel === 'month') {
      range = getMonthRange(year, currentYear, currentMonth)
    } else if (detailLevel === 'week') {
      range = getWeekRange(year, currentYear, currentWeek)
    } else if (detailLevel === 'day') {
      range = getDayRange(year, month, currentYear, currentMonth)
    }
    for (let unit in range) headers.push(unit)
    return headers
  },

  getTimesheetEntries (headers, people, timesheet) {
    const entries = [headers]
    people.forEach((person) => {
      const line = [person.full_name]
      headers.forEach((h, index) => {
        if (index > 0) {
          index--
          if (
            timesheet &&
            timesheet[index] &&
            timesheet[index][person.id]
          ) {
            line.push(timesheet[index][person.id] / 60)
          } else {
            line.push('-')
          }
        }
      })
      entries.push(line)
    })
    return entries
  },

  buildCsvFile (name, entries) {
    const lineArray = []
    entries.forEach((infoArray) => {
      const line = infoArray.join(';')
      lineArray.push(line)
    })
    const csvContent = 'data:text/csv;charset=utf-8,' + lineArray.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${name}.csv`)
    document.body.appendChild(link)
    link.click()
  }
}

export default csv
