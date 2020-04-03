import Papa from 'papaparse'
import {
  getDayRange,
  getMonthRange,
  getWeekRange
} from './time'
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
    const headers = csv.getTimesheetHeaders(
      detailLevel,
      year,
      month,
      currentYear,
      currentMonth,
      currentWeek
    )
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
    for (const unit in range) headers.push(unit)
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

  turnEntriesToCsvString (entries) {
    const lineArray = []
    entries.forEach((infoArray) => {
      const sanitizedCells = infoArray.map((cell) => {
        const cellString = `${cell || ''}`
        return `"${cellString.replace(/"/g, '')}"`
      })
      const line = sanitizedCells.join(';')
      if (line.length > 2) lineArray.push(line)
    })
    return lineArray.join('\n')
  },

  buildCsvFile (name, entries) {
    const csvContent = csv.turnEntriesToCsvString(entries)
    const result = 'data:text/csv;charset=utf-8,' + csvContent
    const encodedUri = encodeURI(result)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${name}.csv`)
    document.body.appendChild(link)
    link.click()
    return csvContent
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
    const taskTypeIds = getStatsTaskTypeIds(mainStats, taskTypeMap)
    const initialHeaders = ['name', '', 'All', '']
    return taskTypeIds.reduce((acc, taskTypeId) => {
      if (taskTypeId !== 'all') {
        const taskTypeName = taskTypeMap[taskTypeId].name
        return acc.concat([taskTypeName, ''])
      } else {
        return acc
      }
    }, initialHeaders)
  },

  getStatReportsEntries (
    mainStats, taskTypeMap, taskStatusMap, entryMap, countMode = 'count'
  ) {
    let entries = []
    const taskTypeIds = getStatsTaskTypeIds(mainStats, taskTypeMap)
    const entryIds = getStatsEntryIds(mainStats, entryMap)

    entryIds.forEach((entryId) => {
      const taskStatusIds = getStatsTaskStatusIdsForEntry(mainStats, entryId)
      const total = getStatsTotalCount(mainStats, taskStatusIds, countMode, entryId)
      const lineMap = buildTotalLines(
        entryMap,
        taskStatusMap,
        countMode,
        mainStats,
        taskStatusIds,
        entryId,
        total
      )

      taskTypeIds.forEach((taskTypeId) => {
        if (taskTypeId !== 'all') {
          const taskTypeStats = mainStats[entryId][taskTypeId]
          if (taskTypeStats) {
            const total = getStatsTotalEntryCount(
              mainStats,
              taskTypeStats,
              countMode,
              entryId,
              taskTypeId
            )
            addEntryStatusStats(
              mainStats,
              countMode,
              entryId,
              taskTypeId,
              taskStatusIds,
              total,
              lineMap
            )
          } else {
            Object.keys(mainStats[entryId].all).forEach((taskStatusId) => {
              lineMap[taskStatusId] =
                lineMap[taskStatusId].concat(['', ''])
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
  },

  processCSV: (data, config) => {
    return new Promise((resolve, reject) => {
      Papa.parse(data, {
        config: config,
        encoding: 'ISO-8859-1',
        error: reject,
        complete: (results) => {
          resolve(results.data)
        }
      })
    })
  }
}

const getStatsTaskTypeIds = (mainStats, taskTypeMap) => {
  return Object.keys(mainStats.all)
    .sort((a, b) => {
      if (a === 'all') return 1
      if (b === 'all') return -1
      return taskTypeMap[a].priority - taskTypeMap[b].priority
    })
}

const getStatsEntryIds = (mainStats, entryMap) => {
  return Object.keys(mainStats)
    .sort((a, b) => {
      if (a === 'all') return -1
      if (b === 'all') return 1
      return entryMap[a].name.localeCompare(entryMap[b].name)
    })
}

const getStatsTotalCount = (mainStats, taskStatusIds, countMode, entryId) => {
  let total = 0
  taskStatusIds.forEach((taskStatusId) => {
    const taskStatusStats = mainStats[entryId].all[taskStatusId]
    total += taskStatusStats[countMode]
  })
  return total
}

const getStatsTaskStatusIdsForEntry = (mainStats, entryId) => {
  return Object.keys(mainStats[entryId].all)
}

const getStatsTotalEntryCount = (
  mainStats,
  taskTypeStats,
  countMode,
  entryId,
  taskTypeId
) => {
  let total = 0
  Object.keys(taskTypeStats).forEach((taskStatusId) => {
    const taskStatusStats =
      mainStats[entryId][taskTypeId][taskStatusId]
    total += taskStatusStats[countMode]
  })
  return total
}

const buildTotalLines = (
  entryMap,
  taskStatusMap,
  countMode,
  mainStats,
  taskStatusIds,
  entryId,
  total
) => {
  const lineMap = {}
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
  return lineMap
}

const addEntryStatusStats = (
  mainStats,
  countMode,
  entryId,
  taskTypeId,
  taskStatusIds,
  total,
  lineMap
) => {
  taskStatusIds.forEach((taskStatusId) => {
    const taskStatusStats =
      mainStats[entryId][taskTypeId][taskStatusId]
    let count = 0
    if (taskStatusStats) count = taskStatusStats[countMode]
    const percentage = getPercentage(count, total)
    lineMap[taskStatusId] =
      lineMap[taskStatusId].concat([count, percentage + '%'])
  })
}

export default csv
