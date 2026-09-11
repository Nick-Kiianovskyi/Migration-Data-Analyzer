import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'sample-data')
mkdirSync(outDir, { recursive: true })

const COLUMNS = ['SKU', 'MaterialName', 'Category', 'Supplier', 'UnitPrice', 'StockQty', 'Status', 'UpdatedAt']

const CATEGORIES = ['Raw Material', 'Component', 'Packaging', 'Fixture', 'Consumable']
const SUPPLIERS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Ind.', 'Wayne Ent.']
const STATUS = ['Active', 'Discontinued', 'Pending', 'Backorder']

function pad(n, width) {
  return String(n).padStart(width, '0')
}

function buildRow(skuId, seed) {
  const sku = `SKU-${pad(skuId, 6)}`
  const materialName = `Material${pad((seed % 9000) + 1000, 4)}`
  const category = CATEGORIES[seed % CATEGORIES.length]
  const supplier = SUPPLIERS[(seed * 3) % SUPPLIERS.length]
  const unitPrice = (10 + ((seed * 137) % 4890) / 100).toFixed(2)
  const stockQty = String((seed * 7) % 2000)
  const status = STATUS[seed % STATUS.length]
  const updatedAt = `2026-0${(seed % 6) + 1}-${pad((seed * 11) % 27 + 1, 2)}`
  return [sku, materialName, category, supplier, unitPrice, stockQty, status, updatedAt]
}

function modifyRow(row, seed) {
  const unitPrice = (5 + ((seed * 137) % 4900) / 100).toFixed(2)
  const status = STATUS[(seed + 2) % STATUS.length]
  const updatedAt = `2026-07-${pad((seed * 11) % 27 + 1, 2)}`
  return [row[0], row[1], row[2], row[3], unitPrice, row[5], status, updatedAt]
}

function markAdded(row, seed) {
  return [row[0], row[1], 'Component', row[3], row[4], row[5], 'Pending', `2026-08-${pad((seed * 11) % 27 + 1, 2)}`]
}

function buildPair(name, nBefore, nRemoved, nAdded, nModified) {
  const modifiedIds = new Set()
  for (let i = 1; i <= nModified; i += 1) modifiedIds.add(i)

  const removedIds = new Set()
  for (let i = nBefore - nRemoved + 1; i <= nBefore; i += 1) removedIds.add(i)

  const beforeLines = [COLUMNS.join(',')]
  for (let i = 1; i <= nBefore; i += 1) {
    beforeLines.push(buildRow(i, i).join(','))
  }

  const afterLines = [COLUMNS.join(',')]
  let seed = nBefore + 1
  for (let i = 1; i <= nBefore + nAdded - nRemoved; i += 1) {
    let id = i
    if (i > nBefore - nRemoved) {
      id = nBefore + (i - (nBefore - nRemoved))
    }
    if (removedIds.has(id)) continue
    let row = buildRow(id, id)
    if (modifiedIds.has(id)) {
      row = modifyRow(row, id + 50000)
    }
    if (id > nBefore) {
      row = markAdded(row, seed)
      seed += 1
    }
    afterLines.push(row.join(','))
  }

  const beforePath = join(outDir, `${name}_before.csv`)
  const afterPath = join(outDir, `${name}_after.csv`)
  const before = beforeLines.join('\n') + '\n'
  const after = afterLines.join('\n') + '\n'
  writeFileSync(beforePath, before)
  writeFileSync(afterPath, after)

  const beforeBytes = Buffer.byteLength(before)
  const afterBytes = Buffer.byteLength(after)
  console.log(`[${name}]`)
  console.log(`  before: ${nBefore.toLocaleString()} rows, ${(beforeBytes / 1024).toFixed(0)} KB`)
  console.log(`  after:  ${(nBefore + nAdded - nRemoved).toLocaleString()} rows, ${(afterBytes / 1024).toFixed(0)} KB`)
  console.log(`  semantics: ${nModified.toLocaleString()} modified, ${nRemoved.toLocaleString()} removed, ${nAdded.toLocaleString()} added; key = SKU`)
}

buildPair('small', 500, 25, 45, 40)
buildPair('large', 52000, 2600, 5200, 5200)

console.log('\nGenerated into sample-data/. Test:')
console.log('  small_before.csv + small_after.csv  -> badge JavaScript (total < 5 MB)')
console.log('  large_before.csv + large_after.csv  -> badge DuckDB WASM (total > 5 MB)')