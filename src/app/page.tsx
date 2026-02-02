'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STORAGE_KEY = 'amz2freee:selected-keys:v1'
const CSV_STORAGE_KEY = 'amz2freee:csv:v1'
const OVERRIDES_STORAGE_KEY = 'amz2freee:row-overrides:v1'

const REQUIRED_COLUMNS = ['Order ID', 'Order Date', 'Product Name', 'Total Owed']

type CsvRow = Record<string, string>

type ParsedData = {
  rows: CsvRow[]
  fields: string[]
  fileName: string
}

type Step = 1 | 2 | 3

type RowOverrides = Record<string, { accountTitle?: string; taxCategory?: string }>

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
  '取引先',
  '取引先コード',
  '勘定科目',
  '税区分',
  '金額',
  '税計算区分',
  '税額',
  '備考',
  '品目',
  '部門',
  'メモタグ（複数指定可、カンマ区切り）',
  '決済日',
  '決済口座',
  '決済金額',
  'セグメント1',
  'セグメント2',
  'セグメント3',
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
  const asin = row['ASIN'] ?? ''
  const quantity = row['Quantity'] ?? ''
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
    'Amazon.co.jp',
    '',
    accountTitle,
    taxCategory,
    amount,
    '内税',
    calcTaxAmount(row),
    noteParts,
    productName,
    '',
    '',
    formattedDate,
    '',
    amount,
    '',
    '',
    '',
  ]
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ keys: Array.from(selectedKeys) }))
  }, [selectedKeys])

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
    if (!raw) return
    try {
      const data = JSON.parse(raw) as ParsedData
      if (data?.rows?.length && data?.fields?.length) {
        setParsed(data)
        setStep(2)
      }
    } catch {
      // ignore invalid storage
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
        setSelectedYear('all')
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
      {!parsed && (
        <div className="flex min-h-screen flex-col">
          <header className="flex h-16 items-center justify-center px-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {[1, 2, 3].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleStepClick(item as Step)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
                    step === item
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs font-semibold">
                    {item}
                  </span>
                  <span>
                    {item === 1 && 'アップロード'}
                    {item === 2 && '対象選択'}
                    {item === 3 && 'エクスポート設定'}
                  </span>
                </button>
              ))}
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center px-6 py-10">
            <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex flex-col gap-2 text-center">
                <p className="text-sm font-semibold text-muted-foreground">
                  Amazon注文データ → freee会計CSV
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">Amazon注文CSVアップロード</h1>
                <p className="text-sm text-muted-foreground">
                  アップロード対象は{' '}
                  <span className="font-medium text-foreground">Retail.OrderHistory.3.csv</span>{' '}
                  です。
                </p>
              </div>

              <div
                className={`mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center transition ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-2">
                  <p className="text-base font-medium">CSVをドラッグ＆ドロップ</p>
                  <p className="text-sm text-muted-foreground">またはボタンから選択してください</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => handleFiles(event.target.files)}
                  className="hidden"
                />
                <Button onClick={() => inputRef.current?.click()}>CSVを選択</Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </section>
          </div>
        </div>
      )}

      {parsed && (
        <div className="flex min-h-screen flex-col">
          <header className="flex h-16 items-center justify-center px-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {[1, 2, 3].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleStepClick(item as Step)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
                    step === item
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs font-semibold">
                    {item}
                  </span>
                  <span>
                    {item === 1 && 'アップロード'}
                    {item === 2 && '対象選択'}
                    {item === 3 && 'エクスポート設定'}
                  </span>
                </button>
              ))}
            </div>
          </header>
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-10 pt-4">
            {step === 3 && (
              <section className="flex flex-col gap-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">エクスポート設定</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">勘定科目</label>
                      <Input
                        placeholder="例: 消耗品費"
                        value={accountTitle}
                        onChange={(event) => setAccountTitle(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">税区分</label>
                      <Input
                        placeholder="例: 課税仕入 10%"
                        value={taxCategory}
                        onChange={(event) => setTaxCategory(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">決済日基準</label>
                      <Select
                        value={settlementBase}
                        onValueChange={(value) => setSettlementBase(value as 'order' | 'ship')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start" sideOffset={6} className="z-[100]">
                          <SelectItem value="order">Order Date</SelectItem>
                          <SelectItem value="ship">Ship Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">選択件数</label>
                      <div className="text-sm text-muted-foreground">
                        {selectedCount.toLocaleString()} 件
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">エクスポートCSVプレビュー</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>最大50件を表示</span>
                      <Button onClick={handleExportCsv} disabled={selectedRows.length === 0}>
                        CSVをエクスポート
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 max-h-[60vh] overflow-auto rounded-2xl border border-border">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-muted/30">
                        <TableRow>
                          {FREEE_HEADERS.map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRows.slice(0, 50).map((row, index) => {
                          const cells = buildFreeeRow(row, {
                            accountTitle,
                            taxCategory,
                            settlementBase,
                            overrides: rowOverrides,
                          })
                          const key = rowKey(row) || String(index)
                          const override = rowOverrides[key] ?? {}
                          const accountValue = override.accountTitle ?? accountTitle ?? ''
                          const taxValue = override.taxCategory ?? taxCategory ?? ''
                          return (
                            <TableRow key={key}>
                              {cells.map((cell, cellIndex) => {
                                if (cellIndex === 6) {
                                  return (
                                    <TableCell key={`${key}-account`}>
                                      <Input
                                        className="h-8"
                                        value={accountValue}
                                        onChange={(event) =>
                                          handleOverrideChange(row, 'accountTitle', event.target.value)
                                        }
                                      />
                                    </TableCell>
                                  )
                                }
                                if (cellIndex === 7) {
                                  return (
                                    <TableCell key={`${key}-tax`}>
                                      <Input
                                        className="h-8"
                                        value={taxValue}
                                        onChange={(event) =>
                                          handleOverrideChange(row, 'taxCategory', event.target.value)
                                        }
                                      />
                                    </TableCell>
                                  )
                                }
                                return (
                                  <TableCell
                                    key={`${key}-${cellIndex}`}
                                    className={
                                      cellIndex === 8 || cellIndex === 17 ? 'text-right' : 'whitespace-nowrap'
                                    }
                                  >
                                    {cell || '-'}
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })}
                        {selectedRows.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={FREEE_HEADERS.length} className="py-8 text-center text-sm text-muted-foreground">
                              まだ選択された注文がありません。
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">注文一覧</h2>
                  <span className="text-sm text-muted-foreground">
                    全{parsed ? parsed.rows.length.toLocaleString() : 0}件
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{selectedCount.toLocaleString()}件選択中</span>
                  <div className="flex items-center gap-2">
                    <span>対象年</span>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start" sideOffset={6} className="z-[100]">
                        <SelectItem value="all">全て</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setStep(3)} disabled={selectedCount === 0}>
                    エクスポート設定へ
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex-1 overflow-auto rounded-2xl border border-border">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[48px]">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={
                              allVisibleSelected
                                ? true
                                : someVisibleSelected
                                  ? 'indeterminate'
                                  : false
                            }
                            onCheckedChange={handleToggleAll}
                          />
                        </div>
                      </TableHead>
                      <TableHead>注文日</TableHead>
                      <TableHead>注文ID</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>支払い</TableHead>
                      <TableHead>配送状況</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row, index) => {
                      const key = rowKey(row) || String(index)
                      const isChecked = selectedKeys.has(key)
                      return (
                        <TableRow
                          key={key}
                          className={isChecked ? 'bg-primary/5' : ''}
                          onClick={() => handleRowToggle(row)}
                        >
                          <TableCell onClick={(event) => event.stopPropagation()}>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleRowToggle(row)}
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {row['Order Date'] ?? '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {row['Order ID'] ?? '-'}
                          </TableCell>
                          <TableCell className="min-w-[260px] max-w-[360px] truncate">
                            {row['Product Name'] ?? '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {row['Quantity'] ?? '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {row['Total Owed']
                              ? `${row['Total Owed']} ${row['Currency'] ?? ''}`
                              : '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {row['Payment Instrument Type'] ?? '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {row['Shipment Status'] ?? '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {parsed && filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          該当する年のデータがありません。
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
            )}

            {step === 3 && null}
          </div>
        </div>
      )}
    </main>
  )
}
