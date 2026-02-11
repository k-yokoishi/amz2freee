'use client'

import { useEffect, useMemo, useState } from 'react'

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
import { buildFreeeCsv } from '@/features/freee/utils/buildFreeeCsv'
import { buildFreeeRow } from '@/features/freee/utils/buildFreeeRow'
import { getFreeeHeaders } from '@/features/freee/utils/getFreeeHeaders'
import { inferTaxCategory } from '@/features/freee/utils/inferTaxCategory'
import { usePersistentState } from '@/features/_shared/utils/hooks/usePersistentState'

const CSV_STORAGE_KEY = 'amz2freee:csv:v1'
const OVERRIDES_STORAGE_KEY = 'amz2freee:row-overrides:v1'

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
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [uploadState, setUploadState] = useState<{
    sourceType: SourceType
    uploads: Array<{ name: string; rows: CsvRow[] }>
  }>({ sourceType: 'amazon', uploads: [] })
  const [step, setStep] = useState<Step>(1)
  const [rowOverrides, setRowOverrides] = usePersistentState<RowOverrides>(
    OVERRIDES_STORAGE_KEY,
    {},
  )
  const [isLoadingCsv, setIsLoadingCsv] = useState(true)

  const taxCategory = '課対仕入10%'
  const settlementBase: 'order' | 'ship' = 'order'

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
        setUploadState({ sourceType: data.sourceType ?? 'amazon', uploads: [] })
      }
    } catch {
      // ignore invalid storage
    } finally {
      setIsLoadingCsv(false)
    }
  }, [])

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
      uploads = await parserBySourceType[uploadState.sourceType](files)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'CSV読み込みに失敗しました。'
      setError(message)
      return
    }

    switch (uploadState.sourceType) {
      case 'amazon': {
        const first = uploads[0]
        const data: ParsedData = {
          rows: first.rows,
          fields: first.fields,
          fileName: first.name,
          sourceType: uploadState.sourceType,
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
          sourceType: uploadState.sourceType,
        }
        setParsed(data)
        localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
        setStep(2)
        return
      }
      case 'jcb': {
        setUploadState((prev) => ({
          sourceType: prev.sourceType,
          uploads:
            prev.sourceType === 'jcb'
              ? [...prev.uploads, ...uploads].map((upload) => ({
                  name: upload.name,
                  rows: upload.rows,
                }))
              : uploads.map((upload) => ({ name: upload.name, rows: upload.rows })),
        }))
        return
      }
      case 'orico': {
        setUploadState((prev) => ({
          sourceType: prev.sourceType,
          uploads:
            prev.sourceType === 'orico'
              ? [...prev.uploads, ...uploads].map((upload) => ({
                  name: upload.name,
                  rows: upload.rows,
                }))
              : uploads.map((upload) => ({ name: upload.name, rows: upload.rows })),
        }))
        return
      }
      default:
        return assertNever(uploadState.sourceType)
    }
  }

  const handleClearUpload = () => {
    setParsed(null)
    setSelectedKeys(new Set())
    setStep(1)
    setRowOverrides({})
    setUploadState({ sourceType: 'amazon', uploads: [] })
    localStorage.removeItem(CSV_STORAGE_KEY)
    localStorage.removeItem(OVERRIDES_STORAGE_KEY)
  }

  const handleConfirmCardUpload = () => {
    if (uploadState.sourceType !== 'jcb' && uploadState.sourceType !== 'orico') return
    if (uploadState.uploads.length === 0) return
    const rows = normalizeRows(uploadState.uploads.flatMap((item) => item.rows))
    const data: ParsedData = {
      rows,
      fields: Object.keys(rows[0]?.value ?? {}),
      fileName: uploadState.uploads.map((item) => item.name).join(', '),
      sourceType: uploadState.sourceType,
    }
    setParsed(data)
    localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(data))
    setStep(2)
  }

  const handleSourceTypeChange = (nextSourceType: SourceType) => {
    setUploadState((prev) =>
      prev.sourceType === nextSourceType ? prev : { sourceType: nextSourceType, uploads: [] },
    )
    setError(null)
  }

  const handleStepClick = (next: Step) => {
    if (next === 1) {
      handleClearUpload()
      return
    }
    if (!parsed) return
    if (next === 3 && selectedRows.length === 0) return
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
          sourceType={uploadState.sourceType}
          onSourceTypeChange={handleSourceTypeChange}
          handleFiles={handleFiles}
          error={error}
          uploadedFiles={uploadState.uploads.map((item) => item.name)}
          onConfirmUpload={handleConfirmCardUpload}
        />
      )}

      {!isLoadingCsv && parsed && (
        <>
          {step === 2 && (
            <SelectStep
              step={step}
              handleStepClick={handleStepClick}
              rows={parsed.rows}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
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
