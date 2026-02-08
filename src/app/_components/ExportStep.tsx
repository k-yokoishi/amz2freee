import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CsvRow, RowOverrides, Step } from '@/app/types'

type ExportStepProps = {
  step: Step
  handleStepClick: (next: Step) => void
  taxCategory: string
  settlementBase: 'order' | 'ship'
  selectedRows: CsvRow[]
  rowKey: (row: CsvRow) => string
  rowOverrides: RowOverrides
  handleExportCsv: () => void
  buildFreeeRow: (
    row: CsvRow,
    options: {
      taxCategory: string
      settlementBase: 'order' | 'ship'
      overrides: RowOverrides
    }
  ) => string[]
  inferTaxCategory: (row: CsvRow) => string
  FREEE_HEADERS: string[]
}

export default function ExportStep({
  step,
  handleStepClick,
  taxCategory,
  settlementBase,
  selectedRows,
  rowKey,
  rowOverrides,
  handleExportCsv,
  buildFreeeRow,
  inferTaxCategory,
  FREEE_HEADERS,
}: ExportStepProps) {
  return (
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
        <section className="flex flex-col gap-6">
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
                      taxCategory,
                      settlementBase,
                      overrides: rowOverrides,
                    })
                    const key = rowKey(row) || String(index)
                    const override = rowOverrides[key] ?? {}
                    const overrideTax = override.taxCategory?.trim()
                    const baseTax = taxCategory?.trim()
                    const taxValue =
                      overrideTax && overrideTax.length > 0
                        ? overrideTax
                        : baseTax && baseTax.length > 0
                          ? baseTax
                          : inferTaxCategory(row) ?? ''
                    return (
                      <TableRow key={key}>
                        {cells.map((cell, cellIndex) => {
                          if (cellIndex === 6) {
                            return (
                              <TableCell key={`${key}-account`} className="whitespace-nowrap">
                                {cell || '-'}
                              </TableCell>
                            )
                          }
                          if (cellIndex === 7) {
                            return (
                              <TableCell key={`${key}-tax`} className="whitespace-nowrap">
                                {taxValue || '-'}
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
                      <TableCell
                        colSpan={FREEE_HEADERS.length}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        まだ選択された注文がありません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
