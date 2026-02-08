'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'

import UploadStep from '@/app/_components/UploadStep'
import SelectStep from '@/app/_components/SelectStep'
import ExportStep from '@/app/_components/ExportStep'
import type { CsvRow, ParsedData, RowOverrides, SourceType, Step } from '@/app/types'
import { Spinner } from '@/components/ui/spinner'

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

function normalizeJcbDate(value: string | undefined): string {
  if (!value) return ''
  return value.trim()
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

function parseJcbRows(rows: string[][]): CsvRow[] {
  const headerIndex = rows.findIndex(
    (row) => row.includes('ご利用日') && row.includes('ご利用先など')
  )
  if (headerIndex === -1) return []
  const headers = rows[headerIndex]
  const dataRows = rows.slice(headerIndex + 1)
  const result: CsvRow[] = []
  for (const row of dataRows) {
    if (!row || row.length === 0) continue
    if (row[0] && row[0].startsWith('【')) continue
    const map: CsvRow = {}
    headers.forEach((header, index) => {
      map[header] = row[index] ?? ''
    })
    const usageDate = normalizeJcbDate(map['ご利用日'])
    const merchant = (map['ご利用先など'] ?? '').trim()
    const amount = (map['お支払い金額(￥)'] ?? map['ご利用金額(￥)'] ?? '').trim()
    if (!usageDate && !merchant && !amount) continue
    result.push({
      Website: 'MyJCB',
      'Order ID': '',
      'Order Date': usageDate,
      'Ship Date': usageDate,
      'Product Name': merchant,
      Quantity: '1',
      Currency: 'JPY',
      'Total Owed': amount,
      'Unit Price': amount,
      'Shipment Item Subtotal': amount,
      'Shipment Item Subtotal Tax': '',
      'Unit Price Tax': '',
      'Payment Instrument Type': 'JCB',
      'Order Status': '',
      'Shipment Status': '',
    })
  }
  return result
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

function inferTaxCategory(row: CsvRow): string {
  const quantity = parseNumber(row['Quantity']) ?? 1
  const subtotal = parseNumber(row['Shipment Item Subtotal'])
  const unitPrice = parseNumber(row['Unit Price'])
  const baseAmount =
    subtotal ?? (unitPrice !== null && quantity !== null ? unitPrice * quantity : null)

  const directTax = parseNumber(row['Shipment Item Subtotal Tax'])
  const unitTax = parseNumber(row['Unit Price Tax'])
  const taxAmount =
    directTax ?? (unitTax !== null && quantity !== null ? unitTax * quantity : null)

  if (!baseAmount || !taxAmount || baseAmount <= 0 || taxAmount <= 0) return '対象外'

  const rate = taxAmount / baseAmount
  if (rate >= 0.095) return '課対仕入10%'
  if (rate >= 0.075) return '課対仕入8%（軽）'
  return '課対仕入'
}

function normalizeOverride(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function buildFreeeRow(
  row: CsvRow,
  options: {
    taxCategory: string
    settlementBase: 'order' | 'ship'
    overrides: RowOverrides
  }
): string[] {
  const dateValue = options.settlementBase === 'ship' ? row['Ship Date'] : row['Order Date']
  const productName = row['Product Name'] ?? ''
  const noteParts = productName
  const amount = row['Total Owed'] ?? ''
  const override = options.overrides[rowKey(row)] ?? {}
  const accountTitle = normalizeOverride(override.accountTitle) ?? ''
  const overrideTax = normalizeOverride(override.taxCategory)
  const baseTax = normalizeOverride(options.taxCategory)
  const taxCategory = '課対仕入10%'
  const formattedDate = formatJstDate(dateValue)
  return [
    '支出',
    '',
    formattedDate,
    '',
    '',
    '',
    accountTitle,
    taxCategory,
    amount,
    '内税',
    calcTaxAmount(row),
    noteParts,
    '',
    '',
    '',
    '',
    '',
    '',
    formattedDate,
    '現金',
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
  const [sourceType, setSourceType] = useState<SourceType>('amazon')
  const [taxCategory] = useState('')
  const [settlementBase] = useState<'order' | 'ship'>('order')
  const [step, setStep] = useState<Step>(1)
  const [rowOverrides, setRowOverrides] = useState<RowOverrides>({})
  const [isLoadingCsv, setIsLoadingCsv] = useState(true)
  const [jcbUploads, setJcbUploads] = useState<Array<{ name: string; rows: CsvRow[] }>>([])

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
        setSourceType(data.sourceType ?? 'amazon')
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    if (sourceType === 'amazon') {
      const file = files[0]
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
          const data = {
            rows: result.data,
            fields,
            fileName: file.name,
            sourceType: 'amazon' as SourceType,
          }
          setParsed(data)
          localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
          setStep(2)
        },
        error: (err) => {
          setParsed(null)
          setError(err.message)
        },
      })
      return
    }

    const nextUploads: Array<{ name: string; rows: CsvRow[] }> = []
    for (const file of Array.from(files)) {
      try {
        const buffer = await file.arrayBuffer()
        const text = new TextDecoder('shift_jis').decode(buffer)
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true })
        const rows = parseJcbRows(parsed.data as string[][])
        nextUploads.push({ name: file.name, rows })
      } catch (err) {
        console.error(err)
        setError('MyJCBのCSV読み込みに失敗しました。')
        return
      }
    }
    setJcbUploads((prev) => [...prev, ...nextUploads])
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
    setJcbUploads([])
    setSourceType('amazon')
    localStorage.removeItem(CSV_STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(OVERRIDES_STORAGE_KEY)
  }

  const handleConfirmJcb = () => {
    if (jcbUploads.length === 0) return
    const rows = jcbUploads.flatMap((item) => item.rows)
    const data: ParsedData = {
      rows,
      fields: Object.keys(rows[0] ?? {}),
      fileName: jcbUploads.map((item) => item.name).join(', '),
      sourceType: 'jcb',
    }
    setParsed(data)
    localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
    setStep(2)
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
            <Spinner className="text-primary" />
            保存したCSVを読み込み中...
          </div>
        </div>
      )}
      {!isLoadingCsv && !parsed && (
        <UploadStep
          step={step}
          handleStepClick={handleStepClick}
          sourceType={sourceType}
          setSourceType={setSourceType}
          isDragging={isDragging}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          inputRef={inputRef}
          handleFiles={handleFiles}
          error={error}
          jcbFiles={jcbUploads.map((item) => item.name)}
          onConfirmJcb={handleConfirmJcb}
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
              taxCategory={taxCategory}
              settlementBase={settlementBase}
              selectedRows={selectedRows}
              rowKey={rowKey}
              rowOverrides={rowOverrides}
              handleOverrideChange={handleOverrideChange}
              handleExportCsv={handleExportCsv}
              buildFreeeRow={buildFreeeRow}
              inferTaxCategory={inferTaxCategory}
              FREEE_HEADERS={FREEE_HEADERS}
            />
          )}
        </>
      )}
    </main>
  )
}
