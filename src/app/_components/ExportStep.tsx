import { Button } from '@/components/ui/button'
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
import type { CsvRow, RowOverrides, Step } from '@/app/types'

const TAX_CATEGORY_OPTIONS = [
  '課対仕入10%',
  '課対仕入8%（軽）',
  '課対仕入8%',
  '課対仕入',
  '対象外',
  '不課税',
  '非課税売上',
  '非課税仕入',
]

type ExportStepProps = {
  step: Step
  handleStepClick: (next: Step) => void
  accountTitle: string
  taxCategory: string
  settlementBase: 'order' | 'ship'
  selectedRows: CsvRow[]
  rowKey: (row: CsvRow) => string
  rowOverrides: RowOverrides
  handleOverrideChange: (row: CsvRow, key: 'accountTitle' | 'taxCategory', value: string) => void
  handleExportCsv: () => void
  buildFreeeRow: (
    row: CsvRow,
    options: {
      accountTitle: string
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
  accountTitle,
  taxCategory,
  settlementBase,
  selectedRows,
  rowKey,
  rowOverrides,
  handleOverrideChange,
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
                      accountTitle,
                      taxCategory,
                      settlementBase,
                      overrides: rowOverrides,
                    })
                    const key = rowKey(row) || String(index)
                    const override = rowOverrides[key] ?? {}
                    const accountValue = override.accountTitle ?? accountTitle ?? ''
                    const taxValue =
                      override.taxCategory ?? taxCategory ?? inferTaxCategory(row) ?? ''
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
                                <Select
                                  value={taxValue || undefined}
                                  onValueChange={(value) =>
                                    handleOverrideChange(row, 'taxCategory', value)
                                  }
                                >
                                  <SelectTrigger size="sm" className="h-8">
                                    <SelectValue placeholder="選択" />
                                  </SelectTrigger>
                                  <SelectContent
                                    position="popper"
                                    align="start"
                                    sideOffset={6}
                                    className="z-[100]"
                                  >
                                    {TAX_CATEGORY_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
