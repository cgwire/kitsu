import { vi } from 'vitest'

// Some lib imports transitively pull the root store; stub it so no Vuex
// store is built.
vi.mock('@/store', () => ({ default: {} }))

import moment from 'moment'

import csv from '@/lib/csv'

describe('lib/csv', () => {
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

    test('ignores empty and single-cell lines', () => {
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

    test('handles matcher columns missing from the line', () => {
      const shortCsv = [
        ['Sequence', 'Name', 'Description'],
        ['SEQ01', 'SH001']
      ]
      expect(csv.getNewEntityNames(shortCsv, [0, 5], {})).toEqual(['SEQ01'])
    })
  })
})
