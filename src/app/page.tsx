'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'

import UploadStep from '@/app/_components/UploadStep'
import SelectStep from '@/app/_components/SelectStep'
import ExportStep from '@/app/_components/ExportStep'
import type { CsvRow, ParsedData, RowOverrides, Step } from '@/app/types'

const STORAGE_KEY = 'amz2freee:selected-keys:v1'
const CSV_STORAGE_KEY = 'amz2freee:csv:v1'
const OVERRIDES_STORAGE_KEY = 'amz2freee:row-overrides:v1'
const SELECTED_YEAR_STORAGE_KEY = 'amz2freee:selected-year:v1'

const REQUIRED_COLUMNS = ['Order ID', 'Order Date', 'Product Name', 'Total Owed']

function normalizeHeader(value: string): string {
  return value
    .replace(/^\ufeff/, '')
    .replace(/^"|"$/g, '')
    .trim()
}

function safeDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function formatJstDate(value: string | undefined): string {
  if (!value) return ''
  const date = safeDate(value)
  if (!date) return ''
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  const yyyy = jst.getUTCFullYear()
  const mm = String(jst.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(jst.getUTCDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

function rowKey(row: CsvRow): string {
  return [
    row['Order ID'],
    row['Product Name'],
    row['Order Date'],
    row['Ship Date'],
    row['Total Owed'],
    row['Quantity'],
  ]
    .filter(Boolean)
    .join('|')
}

const FREEE_HEADERS = [
  '収支区分',
  '管理番号',
  '発生日',
  '決済期日',
  '取引先コード',
  '取引先',
  '勘定科目',
  '税区分',
  '金額',
  '税計算区分',
  '税額',
  '備考',
  '品目',
  '部門',
  'メモタグ（複数指定可、カンマ区切り）',
  'セグメント1',
  'セグメント2',
  'セグメント3',
  '決済日',
  '決済口座',
  '決済金額',
]

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildFreeeCsv(
  rows: CsvRow[],
  options: {
    accountTitle: string
    taxCategory: string
    settlementBase: 'order' | 'ship'
    overrides: RowOverrides
  }
): string {
  const lines: string[][] = [FREEE_HEADERS]
  for (const row of rows) {
    lines.push(buildFreeeRow(row, options))
  }
  return lines.map((line) => line.map((cell) => escapeCsvCell(String(cell))).join(',')).join('\n')
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null
  const normalized = value.replace(/,/g, '')
  const num = Number(normalized)
  return Number.isNaN(num) ? null : num
}

function calcTaxAmount(row: CsvRow): string {
  const direct = row['Shipment Item Subtotal Tax'] ?? ''
  if (direct) return direct
  const unitTax = parseNumber(row['Unit Price Tax'])
  const quantity = parseNumber(row['Quantity'])
  if (unitTax === null || quantity === null) return ''
  const total = unitTax * quantity
  return Number.isInteger(total) ? String(total) : total.toFixed(2)
}

function buildFreeeRow(
  row: CsvRow,
  options: {
    accountTitle: string
    taxCategory: string
    settlementBase: 'order' | 'ship'
    overrides: RowOverrides
  }
): string[] {
  const dateValue = options.settlementBase === 'ship' ? row['Ship Date'] : row['Order Date']
  const productName = row['Product Name'] ?? ''
  const noteParts = ''
  const amount = row['Total Owed'] ?? ''
  const override = options.overrides[rowKey(row)] ?? {}
  const accountTitle = override.accountTitle ?? options.accountTitle ?? ''
  const taxCategory = override.taxCategory ?? options.taxCategory ?? ''
  const formattedDate = formatJstDate(dateValue)
  return [
    '支出',
    row['Order ID'] ?? '',
    formattedDate,
    '',
    '',
    'Amazon.co.jp',
    accountTitle,
    taxCategory,
    amount,
    '内税',
    calcTaxAmount(row),
    noteParts,
    productName,
    '',
    '',
    '',
    '',
    '',
    formattedDate,
    '',
    amount,
  ]
}

function downloadCsv(filename: string, content: string) {
  const bom = '\ufeff'
  const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [accountTitle, setAccountTitle] = useState('')
  const [taxCategory, setTaxCategory] = useState('')
  const [settlementBase, setSettlementBase] = useState<'order' | 'ship'>('order')
  const [step, setStep] = useState<Step>(1)
  const [rowOverrides, setRowOverrides] = useState<RowOverrides>({})
  const [isLoadingCsv, setIsLoadingCsv] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as { keys: string[] }
      setSelectedKeys(new Set(data.keys))
    } catch {
      // ignore invalid storage
    }
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(SELECTED_YEAR_STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as { year?: string }
      if (typeof data?.year === 'string') setSelectedYear(data.year)
    } catch {
      // ignore invalid storage
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ keys: Array.from(selectedKeys) }))
  }, [selectedKeys])

  useEffect(() => {
    localStorage.setItem(
      SELECTED_YEAR_STORAGE_KEY,
      JSON.stringify({ year: selectedYear })
    )
  }, [selectedYear])

  useEffect(() => {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as RowOverrides
      setRowOverrides(data ?? {})
    } catch {
      // ignore invalid storage
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(rowOverrides))
  }, [rowOverrides])

  useEffect(() => {
    const raw = localStorage.getItem(CSV_STORAGE_KEY)
    if (!raw) {
      setIsLoadingCsv(false)
      return
    }
    try {
      const data = JSON.parse(raw) as ParsedData
      if (data?.rows?.length && data?.fields?.length) {
        setParsed(data)
        setStep(2)
      }
    } catch {
      // ignore invalid storage
    } finally {
      setIsLoadingCsv(false)
    }
  }, [])

  const years = useMemo(() => {
    if (!parsed) return [] as string[]
    const set = new Set<string>()
    for (const row of parsed.rows) {
      const date = safeDate(row['Order Date'])
      if (date) set.add(String(date.getFullYear()))
    }
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [parsed])

  useEffect(() => {
    if (selectedYear === 'all') return
    if (years.length === 0) return
    if (!years.includes(selectedYear)) setSelectedYear('all')
  }, [years, selectedYear])

  const filteredRows = useMemo(() => {
    if (!parsed) return [] as CsvRow[]
    if (selectedYear === 'all') return parsed.rows
    return parsed.rows.filter((row) => {
      const date = safeDate(row['Order Date'])
      return date ? String(date.getFullYear()) === selectedYear : false
    })
  }, [parsed, selectedYear])

  const selectedCount = useMemo(() => {
    let count = 0
    for (const row of filteredRows) {
      if (selectedKeys.has(rowKey(row))) count += 1
    }
    return count
  }, [filteredRows, selectedKeys])

  const selectedRows = useMemo(() => {
    if (!parsed) return [] as CsvRow[]
    return parsed.rows.filter((row) => selectedKeys.has(rowKey(row)))
  }, [parsed, selectedKeys])

  const handleExportCsv = () => {
    if (!selectedRows.length) return
    const csv = buildFreeeCsv(selectedRows, {
      accountTitle,
      taxCategory,
      settlementBase,
      overrides: rowOverrides,
    })
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`
    downloadCsv(`amazon_freee_${stamp}.csv`, csv)
  }

  const allVisibleSelected = filteredRows.length > 0 && selectedCount === filteredRows.length
  const someVisibleSelected = selectedCount > 0 && selectedCount < filteredRows.length

  const handleToggleAll = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        for (const row of filteredRows) next.delete(rowKey(row))
        return next
      }
      for (const row of filteredRows) next.add(rowKey(row))
      return next
    })
  }

  const handleRowToggle = (row: CsvRow) => {
    const key = rowKey(row)
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setError(null)

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (result) => {
        const fields = result.meta.fields ?? []
        const missing = REQUIRED_COLUMNS.filter((col) => !fields.includes(col))
        if (missing.length > 0) {
          setParsed(null)
          setError(`必要な列が見つかりません: ${missing.join(', ')}`)
          return
        }
        const data = { rows: result.data, fields, fileName: file.name }
        setParsed(data)
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
        setStep(2)
      },
      error: (err) => {
        setParsed(null)
        setError(err.message)
      },
    })
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setIsDragging(false)
  }

  const handleClearUpload = () => {
    setParsed(null)
    setSelectedKeys(new Set())
    setStep(1)
    setRowOverrides({})
    localStorage.removeItem(CSV_STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(OVERRIDES_STORAGE_KEY)
  }

  const handleStepClick = (next: Step) => {
    if (next === 1) {
      handleClearUpload()
      return
    }
    if (!parsed) return
    if (next === 3 && selectedCount === 0) return
    setStep(next)
  }

  const handleOverrideChange = (
    row: CsvRow,
    key: 'accountTitle' | 'taxCategory',
    value: string
  ) => {
    const k = rowKey(row)
    setRowOverrides((prev) => ({
      ...prev,
      [k]: {
        ...prev[k],
        [key]: value,
      },
    }))
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-accent)_0%,_transparent_55%)]">
      {isLoadingCsv && (
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground shadow-sm">
            <span className="inline-block size-2 animate-pulse rounded-full bg-primary" />
            保存したCSVを読み込み中...
          </div>
        </div>
      )}
      {!isLoadingCsv && !parsed && (
        <UploadStep
          step={step}
          handleStepClick={handleStepClick}
          isDragging={isDragging}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          inputRef={inputRef}
          handleFiles={handleFiles}
          error={error}
        />
      )}

      {!isLoadingCsv && parsed && (
        <>
          {step === 2 && (
            <SelectStep
              step={step}
              handleStepClick={handleStepClick}
              totalRows={parsed.rows.length}
              filteredRows={filteredRows}
              selectedCount={selectedCount}
              allVisibleSelected={allVisibleSelected}
              someVisibleSelected={someVisibleSelected}
              years={years}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              handleToggleAll={handleToggleAll}
              handleRowToggle={handleRowToggle}
              rowKey={rowKey}
              selectedKeys={selectedKeys}
              onGoToExport={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <ExportStep
              step={step}
              handleStepClick={handleStepClick}
              accountTitle={accountTitle}
              setAccountTitle={setAccountTitle}
              taxCategory={taxCategory}
              setTaxCategory={setTaxCategory}
              settlementBase={settlementBase}
              setSettlementBase={setSettlementBase}
              selectedCount={selectedCount}
              selectedRows={selectedRows}
              rowKey={rowKey}
              rowOverrides={rowOverrides}
              handleOverrideChange={handleOverrideChange}
              handleExportCsv={handleExportCsv}
              buildFreeeRow={buildFreeeRow}
              FREEE_HEADERS={FREEE_HEADERS}
            />
          )}
        </>
      )}
    </main>
  )
}
