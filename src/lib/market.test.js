import test from 'node:test'
import assert from 'node:assert/strict'
import { sentimentFromCounts, sentimentOf, tickSize, withChange } from './market.js'
import { SNAPSHOT } from './snapshot.js'

// Persentase harian sesuai yang dilaporkan sumber — dipatok agar salah ketik price/prev langsung terdeteksi.
const REPORTED = { BBCA: 2.82, BBRI: 5.94, BMRI: 3.18, TLKM: 3.4, ASII: 3.81, AMRT: 4.17, ADRO: 6.06, ANTM: 1.82, ICBP: 4.63, GOTO: 0, NVDA: -4.34, AAPL: -0.14 }

test('cuplikan: perubahan dihitung dari penutupan sebelumnya dan cocok dengan sumber', () => {
  const rows = SNAPSHOT.rows.map(withChange)
  assert.deepEqual(rows.map(r => r.code).sort(), Object.keys(REPORTED).sort())
  for (const r of rows) assert.equal(r.change, REPORTED[r.code], `${r.code}: ${r.change} ≠ ${REPORTED[r.code]}`)
})

test('cuplikan: harga saham IDX kelipatan fraksi harga BEI (deteksi salah ketik)', () => {
  for (const r of SNAPSHOT.rows.filter(x => x.ccy === 'IDR'))
    for (const p of [r.price, r.prev]) assert.equal(p % tickSize(p, 'IDR'), 0, `${r.code} ${p}`)
})

test('cuplikan: tidak ada data indikator karangan', () => {
  for (const r of SNAPSHOT.rows) for (const k of ['rsi', 'ema', 'pattern', 'per', 'pbv', 'yld', 'volume']) assert.equal(r[k], null, `${r.code}.${k}`)
})

test('market mood dari breadth BEI 12 Nov 2026 (560/147/238) = 72 → Greed', () => {
  const m = sentimentFromCounts(SNAPSHOT.breadth.advancing, SNAPSHOT.breadth.declining, SNAPSHOT.breadth.unchanged)
  assert.deepEqual([m.sampleSize, m.score, m.label], [945, 72, 'Greed'])
})

test('market mood dari baris provider: naik + turun + tetap = total, kasus tepi', () => {
  const s = sentimentOf([{ change: 1 }, { change: -1 }, { change: 0 }, { change: null }])
  assert.equal(s.advancing + s.declining + s.unchanged, s.sampleSize)
  assert.equal(s.sampleSize, 3) // baris tanpa data perubahan tidak dihitung
  assert.equal(sentimentOf([]).score, null)
  assert.equal(sentimentOf([{ change: 0 }, { change: 0 }]).score, 50)
  assert.equal(sentimentOf([{ change: 1 }, { change: 2 }]).label, 'Extreme Greed')
  assert.equal(sentimentOf([{ change: -1 }]).label, 'Extreme Fear')
})
