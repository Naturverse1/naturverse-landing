export function exportCsv(data: any[]) {
  const header = Object.keys(data[0] || {}).join(',')
  const rows = data.map(row =>
    Object.values(row)
      .map(val => `"${String(val).replace(/"/g, '""')}"`)
      .join(',')
  )
  const csvContent = [header, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'subscribers.csv'
  link.click()
}

