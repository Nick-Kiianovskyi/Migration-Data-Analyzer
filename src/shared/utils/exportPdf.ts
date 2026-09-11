import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ComparisonResult, FullComparisonResult } from '../types'

export function exportToPdf(result: ComparisonResult, fullComparison?: FullComparisonResult | null): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  addTitlePage(doc, result, pageWidth)
  doc.addPage()
  addStatisticsPage(doc, result, pageWidth)
  doc.addPage()
  addChartsPage(doc, result, pageWidth)
  doc.addPage()
  addChangesListPage(doc, result, pageWidth)

  if (fullComparison && fullComparison.cells.length > 0) {
    doc.addPage()
    addFullCellComparisonPage(doc, fullComparison, pageWidth)
  }

  const fileName = `report_${result.keyField}_${formatDate(new Date())}.pdf`
  doc.save(fileName)
}

function addTitlePage(
  doc: jsPDF,
  result: ComparisonResult,
  pageWidth: number
): void {
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageWidth, 80, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('Migration Analysis Report', pageWidth / 2, 35, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Data Comparison Results', pageWidth / 2, 50, { align: 'center' })

  doc.setFontSize(10)
  doc.text(formatTimestamp(result.timestamp), pageWidth / 2, 65, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')

  const infoY = 100
  const labelX = 40
  const valueX = 90

  doc.text('Key Field:', labelX, infoY)
  doc.setFont('helvetica', 'normal')
  doc.text(result.keyField, valueX, infoY)

  doc.setFont('helvetica', 'bold')
  doc.text('Before File:', labelX, infoY + 10)
  doc.setFont('helvetica', 'normal')
  doc.text(result.beforeFileName, valueX, infoY + 10)

  doc.setFont('helvetica', 'bold')
  doc.text('After File:', labelX, infoY + 20)
  doc.setFont('helvetica', 'normal')
  doc.text(result.afterFileName, valueX, infoY + 20)

  doc.setFont('helvetica', 'bold')
  doc.text('Analysis Date:', labelX, infoY + 30)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(new Date()), valueX, infoY + 30)

  const summaryY = infoY + 55
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Summary', pageWidth / 2, summaryY, { align: 'center' })

  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.5)
  doc.line(60, summaryY + 3, pageWidth - 60, summaryY + 3)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const summaryLines = [
    `Total records before migration: ${result.summary.totalBefore}`,
    `Total records after migration: ${result.summary.totalAfter}`,
    `New records added: ${result.summary.added}`,
    `Records removed: ${result.summary.removed}`,
    `Records modified: ${result.summary.modified}`,
    `Records unchanged: ${result.summary.matching}`,
    `Total field-level changes: ${result.summary.totalFieldChanges}`,
  ]

  let y = summaryY + 15
  for (const line of summaryLines) {
    doc.text(line, pageWidth / 2, y, { align: 'center' })
    y += 8
  }
}

function addStatisticsPage(
  doc: jsPDF,
  result: ComparisonResult,
  pageWidth: number
): void {
  addPageHeader(doc, 'Statistics', pageWidth)

  const stats = [
    ['Metric', 'Value'],
    ['Total Records Before', result.summary.totalBefore.toString()],
    ['Total Records After', result.summary.totalAfter.toString()],
    ['New Records', result.summary.added.toString()],
    ['Deleted Records', result.summary.removed.toString()],
    ['Modified Records', result.summary.modified.toString()],
    ['Unchanged Records', result.summary.matching.toString()],
    ['Total Field Changes', result.summary.totalFieldChanges.toString()],
  ]

  autoTable(doc, {
    startY: 40,
    head: [stats[0]],
    body: stats.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    margin: { left: 40, right: 40 },
  })

  const changeRate = result.summary.totalBefore > 0
    ? ((result.summary.totalFieldChanges / result.summary.totalBefore) * 100).toFixed(1)
    : '0'

  const metricsY = 140
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Key Metrics', pageWidth / 2, metricsY, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Change Rate: ${changeRate}%`, pageWidth / 2, metricsY + 15, { align: 'center' })

  const changeBreakdown = result.summary.totalFieldChanges > 0
    ? `Breakdown: ${result.summary.added} added, ${result.summary.removed} removed, ${result.summary.modified} modified`
    : 'No changes detected'

  doc.text(changeBreakdown, pageWidth / 2, metricsY + 25, { align: 'center' })
}

function addChartsPage(
  doc: jsPDF,
  result: ComparisonResult,
  pageWidth: number
): void {
  addPageHeader(doc, 'Charts', pageWidth)

  drawBarChart(doc, result, 30, 50, pageWidth - 60, 80)
  drawPieChart(doc, result, pageWidth / 2 - 40, 150, 80)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Record Distribution by Status', pageWidth / 2, 260, { align: 'center' })
}

function drawBarChart(
  doc: jsPDF,
  result: ComparisonResult,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const values = [
    result.summary.added,
    result.summary.removed,
    result.summary.modified,
    result.summary.matching,
  ]
  const labels = ['Added', 'Removed', 'Modified', 'Unchanged']
  const colors: [number, number, number][] = [
    [34, 197, 94],
    [239, 68, 68],
    [245, 158, 11],
    [59, 130, 246],
  ]

  const maxValue = Math.max(...values, 1)
  const barWidth = (width - 40) / values.length - 5
  const chartHeight = height - 20

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  for (let i = 0; i <= 4; i++) {
    const lineY = y + chartHeight - (chartHeight / 4) * i
    doc.line(x + 30, lineY, x + width, lineY)
  }

  values.forEach((value, i) => {
    const barHeight = (value / maxValue) * chartHeight
    const barX = x + 35 + i * (barWidth + 5)
    const barY = y + chartHeight - barHeight

    doc.setFillColor(...colors[i])
    doc.rect(barX, barY, barWidth, barHeight, 'F')

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.text(value.toString(), barX + barWidth / 2, barY - 2, { align: 'center' })

    doc.setFontSize(7)
    doc.text(labels[i], barX + barWidth / 2, y + chartHeight + 8, { align: 'center' })
  })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Record Changes Overview', x + width / 2, y - 5, { align: 'center' })
}

function drawPieChart(
  doc: jsPDF,
  result: ComparisonResult,
  centerX: number,
  centerY: number,
  radius: number
): void {
  const data = [
    { value: result.summary.added, color: [34, 197, 94] as [number, number, number], label: 'Added' },
    { value: result.summary.removed, color: [239, 68, 68] as [number, number, number], label: 'Removed' },
    { value: result.summary.modified, color: [245, 158, 11] as [number, number, number], label: 'Modified' },
    { value: result.summary.matching, color: [59, 130, 246] as [number, number, number], label: 'Unchanged' },
  ]

  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) {
    doc.setFillColor(200, 200, 200)
    doc.circle(centerX, centerY, radius, 'F')
    doc.setFontSize(10)
    doc.text('No data', centerX, centerY + 3, { align: 'center' })
    return
  }

  let startAngle = -Math.PI / 2
  for (const item of data) {
    if (item.value === 0) continue

    const sliceAngle = (item.value / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle

    doc.setFillColor(...item.color)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(1)

    const steps = 50
    const points: { x: number; y: number }[] = [{ x: centerX, y: centerY }]

    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle / steps) * i
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      })
    }

    doc.lines(
      points.slice(1).map((p, i) => [
        p.x - points[i].x,
        p.y - points[i].y,
      ]),
      points[0].x,
      points[0].y,
      [1, 1],
      'F'
    )

    startAngle = endAngle
  }

  let legendY = centerY + radius + 15
  doc.setFontSize(9)
  for (const item of data) {
    doc.setFillColor(...item.color)
    doc.rect(centerX - 40, legendY - 4, 8, 8, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text(`${item.label}: ${item.value}`, centerX - 28, legendY + 2)
    legendY += 12
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Status Distribution', centerX, centerY - radius - 10, { align: 'center' })
}

function addChangesListPage(
  doc: jsPDF,
  result: ComparisonResult,
  pageWidth: number
): void {
  addPageHeader(doc, 'Changes Detail', pageWidth)

  const modifiedRecords = result.records.filter((r) => r.status === 'modified')

  if (modifiedRecords.length === 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('No modified records found.', pageWidth / 2, 60, { align: 'center' })
    return
  }

  const rows: string[][] = []
  for (const record of modifiedRecords) {
    if (record.fieldChanges) {
      for (const fc of record.fieldChanges) {
        rows.push([
          record.key,
          fc.fieldName,
          fc.oldValue || '(empty)',
          fc.newValue || '(empty)',
        ])
      }
    }
  }

  autoTable(doc, {
    startY: 40,
    head: [[result.keyField, 'Field', 'Old Value', 'New Value']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
      2: { cellWidth: 55 },
      3: { cellWidth: 55 },
    },
    margin: { left: 15, right: 15 },
    didDrawPage: () => {
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    },
  })
}

function addFullCellComparisonPage(
  doc: jsPDF,
  full: FullComparisonResult,
  pageWidth: number
): void {
  addPageHeader(doc, 'Full Cell Comparison', pageWidth)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${full.totalCells.toLocaleString()} cells | ${full.changedCells.toLocaleString()} changed | ${full.missingCells.toLocaleString()} missing | ${full.equalCells.toLocaleString()} equal`,
    pageWidth / 2,
    35,
    { align: 'center' }
  )

  const rows: string[][] = []
  for (const cell of full.cells) {
    rows.push([
      String(cell.row),
      cell.column,
      cell.oldValue || '(empty)',
      cell.newValue || '(empty)',
      cell.status.charAt(0).toUpperCase() + cell.status.slice(1),
    ])
  }

  autoTable(doc, {
    startY: 42,
    head: [['Row', 'Column', 'Before', 'After', 'Status']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 30 },
      2: { cellWidth: 50 },
      3: { cellWidth: 50 },
      4: { cellWidth: 25 },
    },
    margin: { left: 15, right: 15 },
    didDrawPage: () => {
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    },
  })
}

function addPageHeader(doc: jsPDF, title: string, pageWidth: number): void {
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageWidth, 25, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, 16, { align: 'center' })

  doc.setTextColor(0, 0, 0)
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString()
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}_${hours}${minutes}`
}
