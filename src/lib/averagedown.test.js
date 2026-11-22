import test from 'node:test'
import assert from 'node:assert/strict'
import { averageDown as AD, scenarioSteps, scenarios } from './averagedown.js'

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`)
const base = { unit: 'lot', held: 10, avg: 5000, price: 4000, mode: 'qty', addQty: 10 }

test('contoh dasar: 10 lot @5.000 + 10 lot @4.000 → rata-rata 4.500', () => {
  const r = AD(base)
  assert.equal(r.ok, true)
  assert.equal(r.newAvg, 4500)
  assert.equal(r.totalShares, 2000); assert.equal(r.totalUnits, 20); assert.equal(r.addShares, 1000)
  assert.equal(r.buyCost, 4_000_000); assert.equal(r.totalCost, 9_000_000)
  close(r.avgDropPct, -10); close(r.breakEvenBefore, 25); close(r.breakEvenAfter, 12.5)
  assert.equal(r.plBefore, -1_000_000); close(r.plBeforePct, -20); close(r.plAfterPct, -100 / 9)
  assert.equal(r.kind, 'down')
})

test('rumus rata-rata tertimbang (hitung independen, input acak)', () => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 500; i++) {
    const held = Math.floor(rnd() * 500), add = Math.floor(rnd() * 500), avg = 50 + rnd() * 20000, price = 50 + rnd() * 20000, fee = rnd() * 0.5
    const per = i % 2 ? 100 : 1
    const r = AD({ unit: per === 100 ? 'lot' : 'share', held, avg, price, mode: 'qty', addQty: add, feePct: fee })
    const S0 = held * per, x = add * per, Pe = price * (1 + fee / 100)
    if (S0 + x === 0) { assert.equal(r.newAvg, 0); continue }
    close(r.newAvg, (S0 * avg + x * Pe) / (S0 + x))
    for (const v of [r.newAvg, r.totalCost, r.buyCost, r.breakEvenAfter, r.plAfter]) assert.ok(Number.isFinite(v))
  }
})

test('membeli di harga pasar tidak mengubah P/L (tanpa biaya); biaya = selisihnya', () => {
  const a = AD({ ...base, feePct: 0 }); close(a.plAfter, a.plBefore)
  const b = AD({ ...base, feePct: 0.15 }); close(b.plAfter, b.plBefore - b.fee)
  close(b.buyCost, 1000 * 4000 * 1.0015); close(b.fee, 1000 * 4000 * 0.0015)
})

test('mode dana: lot = floor(dana ÷ biaya per lot), sisa dana benar', () => {
  const r = AD({ ...base, mode: 'budget', budget: 4_000_000 }); assert.equal(r.addUnits, 10); assert.equal(r.leftover, 0)
  const s = AD({ ...base, mode: 'budget', budget: 4_399_999 }); assert.equal(s.addUnits, 10); close(s.leftover, 399_999)
  const t = AD({ ...base, mode: 'budget', budget: 399_999 }); assert.equal(t.addUnits, 0); assert.equal(t.newAvg, 5000)
  const f = AD({ ...base, mode: 'budget', budget: 4_006_000, feePct: 0.15 }); assert.equal(f.addUnits, 10) // 10 lot @4.000 + 0,15% = 4.006.000 tepat
  for (const b of [1, 123_456, 9_876_543, 40_000_000]) { const q = AD({ ...base, mode: 'budget', budget: b }); assert.ok(q.buyCost <= b && q.leftover >= 0 && q.leftover < q.oneUnitCost) }
})

test('mode target: jumlah minimal (rata-rata ≤ target, satu lot lebih sedikit belum cukup)', () => {
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 400; i++) {
    const unit = i % 2 ? 'lot' : 'share', held = 1 + Math.floor(rnd() * 300), P = 100 + rnd() * 9000, A0 = P * (1.05 + rnd() * 1.5), T = P + (A0 - P) * (0.05 + rnd() * 0.9), fee = rnd() * 0.3
    const r = AD({ unit, held, avg: A0, price: P, mode: 'target', target: T, feePct: fee })
    assert.equal(r.ok, true); assert.ok(r.addUnits >= 1)
    assert.ok(r.newAvg <= T * (1 + 1e-9), `avg ${r.newAvg} > target ${T}`)
    if (r.addUnits > 1) assert.ok(AD({ unit, held, avg: A0, price: P, mode: 'qty', addQty: r.addUnits - 1, feePct: fee }).newAvg > T * (1 - 1e-9), 'bukan jumlah minimal')
  }
  // kasus eksak: target 4.500 dari 10 lot @5.000, harga 4.000 → tepat 10 lot (tanpa pembulatan berlebih)
  const e = AD({ ...base, mode: 'target', target: 4500 }); assert.equal(e.addUnits, 10); assert.equal(e.newAvg, 4500)
})

test('pesan kesalahan & kasus tepi (tidak ada NaN)', () => {
  assert.equal(AD({ ...base, price: 0 }).ok, false)
  assert.equal(AD({ ...base, avg: 0 }).ok, false)
  assert.match(AD({ ...base, mode: 'target', target: 5000 }).error, /lebih rendah/)
  assert.match(AD({ ...base, mode: 'target', target: 3999 }).error, /tidak mungkin/)
  assert.match(AD({ ...base, mode: 'target', target: 4000 }).error, /tidak mungkin/)
  assert.match(AD({ ...base, held: 0, mode: 'target', target: 4500 }).error, /kepemilikan/)
  const none = AD({ ...base, held: 0, avg: 0, addQty: 5 }); assert.equal(none.kind, 'new'); assert.equal(none.newAvg, 4000); assert.equal(none.avgDropPct, null)
  const up = AD({ ...base, price: 6000 }); assert.equal(up.kind, 'up'); assert.ok(up.newAvg > 5000)
  assert.equal(AD({ ...base, price: 5000 }).kind, 'same')
  const garbage = AD({ unit: 'x', held: 'abc', avg: null, price: '12', addQty: 3, feePct: 'zz', mode: 'zzz' }); assert.equal(garbage.ok, true); assert.equal(garbage.newAvg, 12)
  assert.match(AD({ unit: 'lot', held: 0, avg: 0, price: 12, addQty: -3 }).error, /Isi jumlah/) // tidak ada posisi sama sekali
  const poor = AD({ ...base, held: 0, avg: 0, mode: 'budget', budget: 399_999 }); assert.equal(poor.ok, false); assert.equal(poor.need, 400_000); assert.match(poor.error, /belum cukup/)
  assert.equal(AD(undefined).ok, false)
})

test('satuan lembar (mis. saham AS) dan lot memberi hasil setara', () => {
  const lot = AD({ ...base, unit: 'lot' }), sh = AD({ unit: 'share', held: 1000, avg: 5000, price: 4000, mode: 'qty', addQty: 1000 })
  assert.equal(lot.newAvg, sh.newAvg); assert.equal(lot.totalShares, sh.totalShares)
})

test('skenario: langkah unik & menaik, rata-rata menurun saat lot bertambah', () => {
  assert.deepEqual(scenarioSteps(10), [5, 10, 20, 30, 50]); assert.deepEqual(scenarioSteps(0), [1, 2, 3, 5]); assert.deepEqual(scenarioSteps(1), [1, 2, 3, 5])
  const rows = scenarios(base, scenarioSteps(10)); assert.equal(rows.length, 5)
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i].newAvg < rows[i - 1].newAvg)
  assert.ok(rows.every(r => r.newAvg > 4000)) // tak pernah turun di bawah harga beli
})
