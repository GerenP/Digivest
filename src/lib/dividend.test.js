import test from 'node:test'
import assert from 'node:assert/strict'
import { projectDividends as P } from './dividend.js'

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b} (±${tol})`)

test('tanpa reinvestasi & top-up = rumus deret geometrik', () => {
  const C = 10_000_000, y = 0.05, g = 0.04, n = 10
  const closed = C * y * ((Math.pow(1 + g, n) - 1) / g)
  const r = P({ capital: C, monthly: 0, yieldPct: 5, growthPct: 4, years: n, reinvest: false })
  near(r.totals.dividends, closed, n * 0.5)
  assert.equal(r.rows[0].dividend, 500_000)
  assert.equal(r.totals.value, C)
})

test('reinvestasi tanpa pertumbuhan = bunga majemuk bulanan', () => {
  const C = 20_000_000, y = 0.06, n = 7
  const r = P({ capital: C, monthly: 0, yieldPct: 6, growthPct: 0, years: n, reinvest: true })
  near(r.totals.value, C * Math.pow(1 + y / 12, 12 * n), 0.5)
})

test('top-up bulanan tanpa reinvestasi', () => {
  const C = 5_000_000, c = 1_000_000, y = 0.08, n = 3, M = 36
  const closed = (y / 12) * (C * M + (c * M * (M - 1)) / 2)
  const r = P({ capital: C, monthly: c, yieldPct: 8, growthPct: 0, years: n, reinvest: false })
  near(r.totals.dividends, closed, n * 0.5)
  assert.equal(r.totals.invested, C + c * M)
  assert.equal(r.totals.value, C + c * M)
})

test('total dividen = jumlah baris yang ditampilkan', () => {
  const r = P({ capital: 12_345_678, monthly: 777_777, yieldPct: 6.5, growthPct: 5, years: 25 })
  assert.equal(r.rows.reduce((s, x) => s + x.dividend, 0), r.totals.dividends)
  assert.equal(r.rows.at(-1).cumulative, r.totals.dividends)
})

test('reinvestasi menghasilkan nilai ≥ tanpa reinvestasi', () => {
  const a = P({ capital: 1e7, monthly: 5e5, yieldPct: 5, growthPct: 3, years: 15, reinvest: true })
  const b = P({ capital: 1e7, monthly: 5e5, yieldPct: 5, growthPct: 3, years: 15, reinvest: false })
  assert.ok(a.totals.value > b.totals.value)
  assert.ok(a.totals.dividends > b.totals.dividends)
})

test('input kosong / sampah tidak menghasilkan NaN', () => {
  for (const input of [undefined, {}, { capital: 'abc', years: 'x', yieldPct: null }, { capital: -5, years: 0 }]) {
    const r = P(input)
    assert.ok(r.rows.length >= 1)
    for (const v of Object.values(r.totals)) assert.ok(Number.isFinite(v))
  }
})
