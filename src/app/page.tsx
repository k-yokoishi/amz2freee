'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import UploadStep from '@/app/_components/UploadStep'
import SelectStep from '@/app/_components/SelectStep'
import ExportStep from '@/app/_components/ExportStep'
import type {
  CsvRow,
  ParsedData,
  ParsedUpload,
  RowOverrides,
  SourceFilesParser,
  SourceType,
  Step,
} from '@/features/_shared/types'
import { normalizeRows } from '@/features/_shared/utils/normalizeRows'
import { Spinner } from '@/components/ui/spinner'
import { parseAmazonFiles } from '@/features/amazon/utils/parseAmazonFiles'
import { parseAmazonDigitalFiles } from '@/features/amazonDigital/utils/parseAmazonDigitalFiles'
import { parseJcbFiles } from '@/features/jcb/utils/parseJcbFiles'
import { parseOricoFiles } from '@/features/orico/utils/parseOricoFiles'
import { countSelectedRows } from '@/features/selection/countSelectedRows'
import { extractYears } from '@/features/selection/extractYears'
import { filterRows } from '@/features/selection/filterRows'
import { buildFreeeCsv } from '@/features/freee/utils/buildFreeeCsv'
import { buildFreeeRow } from '@/features/freee/utils/buildFreeeRow'
import { getFreeeHeaders } from '@/features/freee/utils/getFreeeHeaders'
import { inferTaxCategory } from '@/features/freee/utils/inferTaxCategory'

const STORAGE_KEY = 'amz2freee:selected-keys:v1'
const CSV_STORAGE_KEY = 'amz2freee:csv:v1'
const OVERRIDES_STORAGE_KEY = 'amz2freee:row-overrides:v1'
const SELECTED_YEAR_STORAGE_KEY = 'amz2freee:selected-year:v1'

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
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

function assertNever(value: never): never {
  throw new Error(`Unhandled sourceType: ${String(value)}`)
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sourceType, setSourceType] = useState<SourceType>('amazon')
  const [step, setStep] = useState<Step>(1)
  const [rowOverrides, setRowOverrides] = useState<RowOverrides>({})
  const [isLoadingCsv, setIsLoadingCsv] = useState(true)
  const [jcbUploads, setJcbUploads] = useState<Array<{ name: string; rows: CsvRow[] }>>([])
  const [oricoUploads, setOricoUploads] = useState<Array<{ name: string; rows: CsvRow[] }>>([])
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  const taxCategory = '課対仕入10%'
  const settlementBase: 'order' | 'ship' = 'order'

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
    localStorage.setItem(SELECTED_YEAR_STORAGE_KEY, JSON.stringify({ year: selectedYear }))
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
        const withIds = normalizeRows(data.rows)
        const next = { ...data, rows: withIds }
        setParsed(next)
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(next))
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
    return extractYears(parsed.rows)
  }, [parsed])

  useEffect(() => {
    if (selectedYear === 'all') return
    if (years.length === 0) return
    if (!years.includes(selectedYear)) setSelectedYear('all')
  }, [years, selectedYear])

  const filteredRows = useMemo(() => {
    if (!parsed) return [] as CsvRow[]
    return filterRows(parsed.rows, selectedYear, debouncedSearchQuery)
  }, [parsed, selectedYear, debouncedSearchQuery])

  const selectedCount = useMemo(() => {
    return countSelectedRows(filteredRows, selectedKeys)
  }, [filteredRows, selectedKeys])

  const selectedRows = useMemo(() => {
    if (!parsed) return [] as CsvRow[]
    return parsed.rows.filter((row) => selectedKeys.has(row.id))
  }, [parsed, selectedKeys])

  const handleExportCsv = () => {
    if (!selectedRows.length) return
    const csv = buildFreeeCsv(selectedRows, {
      taxCategory,
      settlementBase,
      overrides: rowOverrides,
      sourceType: parsed?.sourceType ?? 'amazon',
    })
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate(),
    ).padStart(2, '0')}`
    downloadCsv(`amazon_freee_${stamp}.csv`, csv)
  }

  const allVisibleSelected = filteredRows.length > 0 && selectedCount === filteredRows.length
  const someVisibleSelected = selectedCount > 0 && selectedCount < filteredRows.length

  const handleToggleAll = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        for (const row of filteredRows) next.delete(row.id)
        return next
      }
      for (const row of filteredRows) next.add(row.id)
      return next
    })
  }

  const handleRowToggle = (row: CsvRow) => {
    const key = row.id
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

    const parserBySourceType: Record<SourceType, SourceFilesParser> = {
      amazon: parseAmazonFiles,
      amazon_digital: parseAmazonDigitalFiles,
      jcb: parseJcbFiles,
      orico: parseOricoFiles,
    }

    let uploads: ParsedUpload[]
    try {
      uploads = await parserBySourceType[sourceType](files)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'CSV読み込みに失敗しました。'
      setError(message)
      return
    }

    switch (sourceType) {
      case 'amazon': {
        const first = uploads[0]
        const data: ParsedData = {
          rows: first.rows,
          fields: first.fields,
          fileName: first.name,
          sourceType,
        }
        setParsed(data)
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
        setStep(2)
        return
      }
      case 'amazon_digital': {
        const first = uploads[0]
        const data: ParsedData = {
          rows: first.rows,
          fields: first.fields,
          fileName: first.name,
          sourceType,
        }
        setParsed(data)
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
        setStep(2)
        return
      }
      case 'jcb': {
        setJcbUploads((prev) =>
          [...prev, ...uploads].map((upload) => ({ name: upload.name, rows: upload.rows })),
        )
        return
      }
      case 'orico': {
        setOricoUploads((prev) =>
          [...prev, ...uploads].map((upload) => ({ name: upload.name, rows: upload.rows })),
        )
        return
      }
      default:
        return assertNever(sourceType)
    }
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
    setOricoUploads([])
    setSourceType('amazon')
    localStorage.removeItem(CSV_STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(OVERRIDES_STORAGE_KEY)
  }

  const handleConfirmJcb = () => {
    if (jcbUploads.length === 0) return
    const rows = normalizeRows(jcbUploads.flatMap((item) => item.rows))
    const data: ParsedData = {
      rows,
      fields: Object.keys(rows[0]?.value ?? {}),
      fileName: jcbUploads.map((item) => item.name).join(', '),
      sourceType: 'jcb',
    }
    setParsed(data)
    localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
    setStep(2)
  }

  const handleConfirmOrico = () => {
    if (oricoUploads.length === 0) return
    const rows = normalizeRows(oricoUploads.flatMap((item) => item.rows))
    const data: ParsedData = {
      rows,
      fields: Object.keys(rows[0]?.value ?? {}),
      fileName: oricoUploads.map((item) => item.name).join(', '),
      sourceType: 'orico',
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
    value: string,
  ) => {
    const k = row.id
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
          oricoFiles={oricoUploads.map((item) => item.name)}
          onConfirmJcb={handleConfirmJcb}
          onConfirmOrico={handleConfirmOrico}
        />
      )}

      {!isLoadingCsv && parsed && (
        <>
          {step === 2 && (
            <SelectStep
              step={step}
              handleStepClick={handleStepClick}
              filteredRows={filteredRows}
              selectedCount={selectedCount}
              allVisibleSelected={allVisibleSelected}
              someVisibleSelected={someVisibleSelected}
              years={years}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleToggleAll={handleToggleAll}
              handleRowToggle={handleRowToggle}
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
              sourceType={parsed.sourceType}
              selectedRows={selectedRows}
              rowOverrides={rowOverrides}
              handleOverrideChange={handleOverrideChange}
              handleExportCsv={handleExportCsv}
              buildFreeeRow={buildFreeeRow}
              inferTaxCategory={inferTaxCategory}
              FREEE_HEADERS={getFreeeHeaders()}
            />
          )}
        </>
      )}
    </main>
  )
}
