// @vitest-environment node

import { vi } from 'vitest'

// Some lib imports transitively pull the root store; stub it so no Vuex
// store is built.
vi.mock('@/store', () => ({ default: {} }))
// The browser download is where an export leaves the app.
vi.mock('@/lib/download', () => ({ downloadBlob: vi.fn() }))

import moment from 'moment'

import csv from '@/lib/csv'
import { downloadBlob } from '@/lib/download'

import { GoneFileReader, TextFileReader } from '../fixtures/file-reader'

describe('lib/csv', () => {
  describe('processCSV', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    const failedReading = file =>
      csv.processCSV(file).then(
        data => {
          throw new Error(`Read ${JSON.stringify(data)}`)
        },
        err => err
      )

    test('parses a CSV file', async () => {
      vi.stubGlobal('FileReader', TextFileReader)
      const file = new File(['Type,Name\nProp, Sword '], 'assets.csv')

      expect(await csv.processCSV(file)).toEqual([
        ['Type', 'Name'],
        ['Prop', 'Sword']
      ])
    })

    test('rejects an empty file as a read failure', async () => {
      vi.stubGlobal('FileReader', TextFileReader)
      const error = await failedReading(new File([], 'assets.csv'))

      csv.logReadFailure(error)

      expect(console.error).toHaveBeenCalledWith(error)
    })

    test('rejects a file the browser cannot read as a read failure', async () => {
      vi.stubGlobal('FileReader', GoneFileReader)
      const error = await failedReading(new File(['Type,Name'], 'assets.csv'))

      csv.logReadFailure(error)

      expect(error.name).toBe('NotFoundError')
      expect(console.error).toHaveBeenCalledWith(error)
    })

    test('leaves any other failure to the caller', () => {
      const bug = new TypeError('data is undefined')

      expect(() => csv.logReadFailure(bug)).toThrow(bug)
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('turnEntriesToCsvString', () => {
    test('escapes spreadsheet formula cells (SEC-8)', () => {
      const entries = [
        ['name', 'description'],
        ['SH010', '=HYPERLINK("http://evil.test";"click")'],
        ['SH020', '+cmd|calc'],
        ['SH030', '@SUM(1;2)'],
        ['SH040', 'plain text']
      ]

      const result = csv.turnEntriesToCsvString(entries)
      const lines = result.split('\n')

      expect(lines[1]).toContain('"\'=HYPERLINK')
      expect(lines[2]).toContain('"\'+cmd|calc"')
      expect(lines[3]).toContain('"\'@SUM(1;2)"')
      // Plain values stay untouched.
      expect(lines[4]).toContain('"plain text"')
      expect(lines[4]).not.toContain("'plain")
    })

    test('keeps the export format: ; delimiter and quoted cells', () => {
      const result = csv.turnEntriesToCsvString([['a', 'b']])
      expect(result).toBe('"a";"b"')
    })
  })

  describe('generateBudget', () => {
    const t = key => key
    const departmentMap = new Map([['dep-1', { name: 'Animation' }]])
    const personMap = new Map([['person-1', { name: 'Alice' }]])
    const months = [moment('2026-01-01'), moment('2026-02-01')]
    const person = {
      budget_entry_id: 'entry-1',
      person_id: 'person-1',
      department_id: 'dep-1',
      position: 'artist',
      seniority: 'senior',
      monthly_salary: 1000,
      months_duration: 2,
      monthCosts: { '2026-01': 1000, '2026-02': 1000 },
      total: 2000
    }
    const budgetDepartments = [
      {
        id: 'dep-1',
        monthCosts: { '2026-01': 1000, '2026-02': 1000 },
        total: 2000,
        persons: [person]
      }
    ]
    const totalEntry = {
      total: 2000,
      monthCosts: { '2026-01': 1000, '2026-02': 1000 }
    }

    let lines
    beforeEach(() => {
      vi.spyOn(csv, 'buildCsvFile').mockImplementation((name, entries) => {
        lines = entries
      })
    })
    afterEach(() => vi.restoreAllMocks())

    test('exports estimated costs only by default', () => {
      csv.generateBudget(
        t,
        departmentMap,
        personMap,
        ['budget'],
        'EUR',
        months,
        totalEntry,
        budgetDepartments
      )
      expect(lines[0]).toEqual([
        'budget.fields.department',
        '',
        '',
        'budget.fields.base_salary',
        'budget.fields.duration',
        'Jan / 26',
        'Feb',
        'main.total (EUR)'
      ])
      expect(lines[3]).toEqual([
        'budget.positions.artist',
        'budget.seniorities.senior',
        'Alice',
        1000,
        2,
        1000,
        1000,
        2000
      ])
    })

    test('exports real costs columns when expenses are given', () => {
      const expenses = {
        monthsBetweenStartAndNow: [months[0]],
        monthsBetweenNowAndEnd: [months[1]],
        convertedExpenses: {
          total: 1200,
          '2026-01': 1200,
          'dep-1': {
            total: 1200,
            '2026-01': 1200,
            'person-1': { total: 1200, '2026-01': 1200 }
          }
        },
        donePrevisional: {
          total: 1000,
          'dep-1': { total: 1000, 'entry-1': 1000 }
        },
        remainingPrevisional: {
          total: 1000,
          'dep-1': { total: 1000, 'entry-1': 1000 }
        }
      }
      csv.generateBudget(
        t,
        departmentMap,
        personMap,
        ['budget'],
        'EUR',
        months,
        totalEntry,
        budgetDepartments,
        expenses
      )
      expect(lines[0]).toEqual([
        'budget.fields.department',
        '',
        '',
        'budget.fields.base_salary',
        'budget.fields.duration',
        'Jan / 26',
        'budget.costs',
        'budget.previsional_costs',
        'budget.difference',
        'Feb',
        'budget.remaining',
        'budget.remaining_and_costs',
        'main.total (EUR)',
        'budget.difference'
      ])
      // Total, department and person rows share the same real-cost columns:
      // real Jan, costs, estimated so far, gap, estimated Feb, remaining,
      // costs + remaining, estimated total, final gap.
      const expected = [1200, 1200, 1000, -200, 1000, 1000, 2200, 2000, -200]
      expect(lines[1].slice(5)).toEqual(expected)
      expect(lines[2].slice(5)).toEqual(expected)
      expect(lines[3].slice(5)).toEqual(expected)
    })

    test('exports empty real costs for a person without expenses', () => {
      const expenses = {
        monthsBetweenStartAndNow: [months[0]],
        monthsBetweenNowAndEnd: [months[1]],
        convertedExpenses: { total: 0 },
        donePrevisional: {
          total: 1000,
          'dep-1': { total: 1000, 'entry-1': 1000 }
        },
        remainingPrevisional: {
          total: 1000,
          'dep-1': { total: 1000, 'entry-1': 1000 }
        }
      }
      csv.generateBudget(
        t,
        departmentMap,
        personMap,
        ['budget'],
        'EUR',
        months,
        totalEntry,
        budgetDepartments,
        expenses
      )
      expect(lines[3].slice(5)).toEqual([
        '',
        0,
        1000,
        1000,
        1000,
        1000,
        1000,
        2000,
        1000
      ])
    })
  })

  describe('renameHeaders', () => {
    const names = new Map([
      ['Séquence', 'Sequence'],
      ['Nom', 'Name'],
      ['Résolution', 'Resolution']
    ])

    test('gives each label its name', () => {
      expect(csv.renameHeaders(['Séquence', 'Nom', 'Notes'], names)).toEqual([
        'Sequence',
        'Name',
        'Notes'
      ])
    })

    test('keeps a label the file also has under its name', () => {
      expect(csv.renameHeaders(['Name', 'Nom'], names)).toEqual(['Name', 'Nom'])
    })

    test('keeps a label that is also the name of a column of its own', () => {
      expect(
        csv.renameHeaders(['Nom', 'Résolution'], names, ['Résolution'])
      ).toEqual(['Name', 'Résolution'])
    })
  })

  describe('getNewEntityNames', () => {
    const parsedCsv = [
      ['Sequence', 'Name', 'Description'],
      ['SEQ01', 'SH001', 'A shot'],
      ['SEQ01', 'SH002', 'Another shot'],
      ['SEQ02', 'SH001', 'Yet another shot']
    ]
    const indexMatchers = [0, 1]

    test('returns lines that do not match any existing entity', () => {
      const database = { SEQ01SH001: true }
      expect(csv.getNewEntityNames(parsedCsv, indexMatchers, database)).toEqual(
        ['SEQ01 / SH002', 'SEQ02 / SH001']
      )
    })

    test('returns no name when every line matches', () => {
      const database = {
        SEQ01SH001: true,
        SEQ01SH002: true,
        SEQ02SH001: true
      }
      expect(csv.getNewEntityNames(parsedCsv, indexMatchers, database)).toEqual(
        []
      )
    })

    test('detects names altered by the spreadsheet (issue #771)', () => {
      const database = { SEQ01SH001: true, SEQ01SH002: true }
      const alteredCsv = [
        ['Sequence', 'Name'],
        ['SEQ01', 'SH1'],
        ['SEQ01', 'SH002']
      ]
      expect(
        csv.getNewEntityNames(alteredCsv, indexMatchers, database)
      ).toEqual(['SEQ01 / SH1'])
    })

    test('deduplicates lines sharing the same matcher key', () => {
      const duplicatedCsv = [
        ['Sequence', 'Name'],
        ['SEQ01', 'SH001'],
        ['SEQ01', 'SH001']
      ]
      expect(csv.getNewEntityNames(duplicatedCsv, indexMatchers, {})).toEqual([
        'SEQ01 / SH001'
      ])
    })

    test('ignores empty lines', () => {
      const sparseCsv = [
        ['Sequence', 'Name'],
        [''],
        ['SEQ01', 'SH001'],
        ['', '']
      ]
      expect(csv.getNewEntityNames(sparseCsv, indexMatchers, {})).toEqual([
        'SEQ01 / SH001'
      ])
    })

    // The preview shows such a line and Kitsu uploads it: the user must see
    // it among the entries to create.
    test('lists a line holding a single cell', () => {
      const singleCellCsv = [
        ['Name', 'Description'],
        ['E010', 'An edit'],
        ['E020']
      ]
      expect(csv.getNewEntityNames(singleCellCsv, [0], {})).toEqual([
        'E010',
        'E020'
      ])
    })

    test('handles matcher columns missing from the line', () => {
      const shortCsv = [
        ['Sequence', 'Name', 'Description'],
        ['SEQ01', 'SH001']
      ]
      expect(csv.getNewEntityNames(shortCsv, [0, 5], {})).toEqual(['SEQ01'])
    })
  })
  describe('buildCsvFile', () => {
    afterEach(() => vi.clearAllMocks())

    test('downloads the entries as a CSV file named after the export', async () => {
      const content = csv.buildCsvFile('timesheet_day_2026', [
        ['Person', '1'],
        ['Alice', 8]
      ])

      expect(content).toBe('"Person";"1"\n"Alice";"8"')
      const [blob, filename] = downloadBlob.mock.lastCall
      expect(filename).toBe('timesheet_day_2026.csv')
      expect(blob.type).toBe('text/csv;charset=utf-8')
      expect(await blob.text()).toBe(content)
    })
  })

  describe('period exports', () => {
    const people = [
      { id: 'person-1', full_name: 'Alice' },
      { id: 'person-2', full_name: 'Bob' }
    ]
    const months = count => Array.from({ length: count }, (_, i) => i + 1)
    let lines

    beforeEach(() => {
      // Today is Tuesday 2026-11-03, in ISO week 45.
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 10, 3, 12))
      // The file is built for real, into the mock of @/lib/download: its
      // rows are read on their way.
      const { buildCsvFile } = csv
      vi.spyOn(csv, 'buildCsvFile').mockImplementation((name, entries) => {
        lines = entries
        return buildCsvFile(name, entries)
      })
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    describe('generateTimesheet', () => {
      const exportTimesheet = options =>
        csv.generateTimesheet({
          name: 'timesheet',
          people,
          unit: 'hour',
          organisation: { hours_by_day: 8 },
          todayYear: 2026,
          todayMonth: 11,
          timesheet: {},
          ...options
        })

      test('gives each day of a past month its date', () => {
        exportTimesheet({
          detailLevel: 'day',
          year: 2026,
          month: 2,
          timesheet: { 1: { 'person-1': 480 }, 28: { 'person-1': 90 } }
        })

        expect(lines[0]).toHaveLength(29)
        expect(lines[0].slice(0, 3)).toEqual([
          'Person',
          '2026-02-01',
          '2026-02-02'
        ])
        expect(lines[0][28]).toBe('2026-02-28')
        expect(lines[1].slice(0, 3)).toEqual(['Alice', 8, '-'])
        expect(lines[1][28]).toBe(1.5)
        expect(lines[2]).toEqual(['Bob', ...Array(28).fill('-')])
      })

      test('stops the current month at today', () => {
        exportTimesheet({ detailLevel: 'day', year: 2026, month: 11 })

        expect(lines[0]).toEqual([
          'Person',
          '2026-11-01',
          '2026-11-02',
          '2026-11-03'
        ])
      })

      test('stops the months and the weeks of the current year at today', () => {
        exportTimesheet({ detailLevel: 'month', year: 2026 })
        expect(lines[0]).toEqual(['Person', ...months(11)])

        exportTimesheet({ detailLevel: 'week', year: 2026 })
        expect(lines[0]).toEqual(['Person', ...months(45)])
      })

      test('lists every month and ISO week of a past year', () => {
        exportTimesheet({ detailLevel: 'month', year: 2025 })
        expect(lines[0]).toEqual(['Person', ...months(12)])

        exportTimesheet({ detailLevel: 'week', year: 2020 })
        expect(lines[0]).toEqual(['Person', ...months(53)])
      })

      test('gives the year level a column per year of the timesheet', () => {
        exportTimesheet({
          detailLevel: 'year',
          timesheet: { 2025: { 'person-1': 600 }, 2026: { 'person-2': 120 } }
        })

        expect(lines).toEqual([
          ['Person', '2025', '2026'],
          ['Alice', 10, '-'],
          ['Bob', '-', 2]
        ])
      })

      test('converts the time to days, or to whole units of the daily rate', () => {
        exportTimesheet({
          detailLevel: 'year',
          unit: 'day',
          timesheet: { 2026: { 'person-1': 720 } }
        })
        expect(lines[1]).toEqual(['Alice', 1.5])

        exportTimesheet({
          detailLevel: 'year',
          unit: 'salary',
          dailyRates: { 'person-1': 300 },
          timesheet: { 2026: { 'person-1': 450 } }
        })
        expect(lines[1]).toEqual(['Alice', 281])
      })
    })

    describe('generateQuotas', () => {
      const quotas = {
        'person-1': {
          day: { count: { '2026-02-01': 3, '2026-02-10': 1.256 } },
          week: { count: { '2025-3': 2 } },
          month: { count: { '2025-03': 12 } }
        }
      }
      const exportQuotas = (detailLevel, year, month) =>
        csv.generateQuotas(
          'quotas',
          quotas,
          people,
          'count',
          detailLevel,
          2026,
          11,
          year,
          month,
          1
        )

      test('reads the quota of each day of the month, to two decimals', () => {
        exportQuotas('day', 2026, 2)

        expect(lines[0]).toHaveLength(29)
        expect(lines[1].slice(0, 3)).toEqual(['Alice', 3, '-'])
        expect(lines[1][10]).toBe(1.26)
        expect(lines[2]).toEqual(['Bob', ...Array(28).fill('-')])
      })

      test('reads the quotas of the weeks and the months of a year', () => {
        exportQuotas('week', 2025)
        expect(lines[0]).toHaveLength(53)
        expect(lines[1].slice(0, 4)).toEqual(['Alice', '-', '-', 2])

        exportQuotas('month', 2025)
        expect(lines[1]).toEqual(['Alice', '-', '-', 12, ...Array(9).fill('-')])
      })
    })
  })

  describe('stat reports', () => {
    const taskTypeMap = new Map([
      ['tt-anim', { id: 'tt-anim', name: 'Animation', priority: 2 }],
      ['tt-layout', { id: 'tt-layout', name: 'Layout', priority: 1 }]
    ])
    const entryMap = new Map([
      ['ep-1', { name: 'E01' }],
      ['ep-2', { name: 'E02' }]
    ])
    let lines

    beforeEach(() => {
      // The file is built for real, into the mock of @/lib/download: its
      // rows are read on their way.
      const { buildCsvFile } = csv
      vi.spyOn(csv, 'buildCsvFile').mockImplementation((name, entries) => {
        lines = entries
        return buildCsvFile(name, entries)
      })
    })

    afterEach(() => vi.restoreAllMocks())

    test('exports the retakes as they come, without the max retake count', () => {
      const bucket = count => ({ count, frames: count * 10, drawings: 0 })
      const retakeStats = (retake, done, other) => ({
        max_retake_count: 2,
        retake: bucket(retake),
        done: bucket(done),
        other: bucket(other)
      })
      const episodeStats = {
        all: retakeStats(3, 5, 2),
        'tt-anim': retakeStats(2, 3, 1),
        'tt-layout': retakeStats(1, 2, 1)
      }

      csv.generateRetakeStatReports(
        'retakes',
        { all: episodeStats, 'ep-1': episodeStats },
        taskTypeMap,
        new Map(),
        entryMap,
        'count',
        {}
      )

      const episodeLines = name => [
        [name, 'retake', 3, '30.00%', 1, '25.00%', 2, '33.33%'],
        [name, 'done', 5, '50.00%', 2, '50.00%', 3, '50.00%'],
        [name, 'other', 2, '20.00%', 1, '25.00%', 1, '16.67%'],
        ['']
      ]
      expect(lines).toEqual([
        ['Name', '', 'All', '', 'Layout', '', 'Animation', ''],
        ...episodeLines('All'),
        ...episodeLines('E01')
      ])
    })

    test('sorts the statuses by name and leaves blank a task type an entry lacks', () => {
      const taskStatusMap = new Map([
        ['wip', { name: 'WIP' }],
        ['done', { name: 'Done' }]
      ])
      const stats = (wip, done) => ({
        wip: { count: wip, frames: 0 },
        done: { count: done, frames: 0 }
      })

      csv.generateStatReports(
        'stats',
        {
          all: { all: stats(1, 3), 'tt-anim': stats(1, 1), 'tt-layout': stats(0, 2) },
          'ep-2': { all: stats(1, 1), 'tt-anim': stats(1, 1) }
        },
        taskTypeMap,
        taskStatusMap,
        entryMap,
        'count',
        {}
      )

      expect(lines).toEqual([
        ['Name', '', 'All', '', 'Layout', '', 'Animation', ''],
        ['All', 'Done', 3, '75.00%', 2, '100.00%', 1, '50.00%'],
        ['All', 'WIP', 1, '25.00%', '0', '0.00%', 1, '50.00%'],
        [''],
        ['E02', 'Done', 1, '50.00%', '', '', 1, '50.00%'],
        ['E02', 'WIP', 1, '50.00%', '', '', 1, '50.00%'],
        ['']
      ])
    })
  })
})
