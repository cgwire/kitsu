import {
  getDayRange,
  getMonthRange,
  getWeekRange
} from './helpers'
import {
  getPercentage
} from './stats'

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
    return lineArray
  },

  generateStatReports (
    name,
    mainStats,
    taskTyeMap,
    taskStatusMap,
    entryMap,
    countMode
  ) {
    const headers =
      csv.getStatReportsHeaders(mainStats, taskTyeMap, taskStatusMap)
    const entries = csv.getStatReportsEntries(
      mainStats,
      taskTyeMap,
      taskStatusMap,
      entryMap,
      countMode
    )
    const lines = [headers, ...entries]
    return csv.buildCsvFile(name, lines)
  },

  getStatReportsHeaders (mainStats, taskTypeMap, taskStatusMap) {
    let headers = ['name', '', 'All', '']
    const taskTypeIds =
      Object.keys(mainStats.all)
        .sort((a, b) => {
          if (a === 'all') return 1
          if (b === 'all') return -1
          return taskTypeMap[a].priority - taskTypeMap[b].priority
        })

    taskTypeIds.forEach((taskTypeId) => {
      if (taskTypeId !== 'all') {
        const taskType = taskTypeMap[taskTypeId]
        headers = headers.concat([taskType.name, ''])
      }
    })
    return headers
  },

  getStatReportsEntries (
    mainStats, taskTypeMap, taskStatusMap, entryMap, countMode = 'count'
  ) {
    let entries = []
    const entryIds =
      Object.keys(mainStats)
        .sort((a, b) => {
          if (a === 'all') return -1
          if (b === 'all') return 1
          return entryMap[a].name.localeCompare(entryMap[b].name)
        })
    const taskTypeIds =
      Object.keys(mainStats.all)
        .sort((a, b) => {
          if (a === 'all') return 1
          if (b === 'all') return -1
          return taskTypeMap[a].priority - taskTypeMap[b].priority
        })

    entryIds.forEach((entryId) => {
      const lineMap = {}
      const taskStatusIds = Object.keys(mainStats[entryId].all)
      let total = 0
      taskStatusIds.forEach((taskStatusId) => {
        const taskStatusStats = mainStats[entryId].all[taskStatusId]
        total += taskStatusStats[countMode]
      })

      taskStatusIds.forEach((taskStatusId) => {
        const taskStatus = taskStatusMap[taskStatusId]
        const entry = entryMap[entryId]
        const name = entry ? entry.name : 'All'
        const taskStatusStats = mainStats[entryId].all[taskStatusId]
        const count = taskStatusStats[countMode]
        const percentage = getPercentage(count, total)
        lineMap[taskStatusId] =
          [name, taskStatus.name, count, percentage + '%']
      })

      taskTypeIds.forEach((taskTypeId) => {
        if (taskTypeId !== 'all') {
          const taskTypeStats = mainStats[entryId][taskTypeId]
          if (taskTypeStats) {
            let total = 0
            const taskTypeStats = mainStats[entryId][taskTypeId]
            Object.keys(taskTypeStats).forEach((taskStatusId) => {
              const taskStatusStats =
                mainStats[entryId][taskTypeId][taskStatusId]
              total += taskStatusStats[countMode]
            })

            taskStatusIds.forEach((taskStatusId) => {
              const taskStatusStats =
                mainStats[entryId][taskTypeId][taskStatusId]
              let count = 0
              if (taskStatusStats) count = taskStatusStats[countMode]
              const percentage = getPercentage(count, total)
              lineMap[taskStatusId].push([count, percentage + '%'])
            })
          } else {
            Object.keys(mainStats[entryId].all).forEach((taskStatusId) => {
              lineMap[taskStatusId].push(['', ''])
            })
          }
        }
      })

      entries = entries.concat(Object.values(lineMap).sort((a, b) => {
        return a[1].localeCompare(b[1])
      }))
      entries.push([''])
    })
    return entries
  }
}

export default csv
