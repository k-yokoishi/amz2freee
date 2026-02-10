import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { CsvRow, Step } from '@/app/types'

type SelectStepProps = {
  step: Step
  handleStepClick: (next: Step) => void
  totalRows: number
  filteredRows: CsvRow[]
  selectedCount: number
  allVisibleSelected: boolean
  someVisibleSelected: boolean
  years: string[]
  selectedYear: string
  setSelectedYear: (value: string) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  handleToggleAll: () => void
  handleRowToggle: (row: CsvRow) => void
  selectedKeys: Set<string>
  onGoToExport: () => void
}

export default function SelectStep({
  step,
  handleStepClick,
  totalRows,
  filteredRows,
  selectedCount,
  allVisibleSelected,
  someVisibleSelected,
  years,
  selectedYear,
  setSelectedYear,
  searchQuery,
  setSearchQuery,
  handleToggleAll,
  handleRowToggle,
  selectedKeys,
  onGoToExport,
}: SelectStepProps) {
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

      <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-6 pb-10 pt-4">
        <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">注文一覧</h2>
              <span className="text-sm text-muted-foreground">
                全{filteredRows.length.toLocaleString()}件
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{selectedCount.toLocaleString()}件選択中</span>
              <div className="flex items-center gap-2">
                <span>検索</span>
                <Input
                  className="h-8 w-[220px]"
                  placeholder="注文ID / 商品名 など"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
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
              <Button onClick={onGoToExport} disabled={selectedCount === 0}>
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
                          allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false
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
                    const key = row.id || String(index)
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
                          <TableCell className="whitespace-nowrap">{row.value['Order Date'] ?? '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.value['Order ID'] ?? '-'}</TableCell>
                      <TableCell className="min-w-[260px] max-w-[360px] truncate">
                        {row.value['Product Name'] ?? '-'}
                      </TableCell>
                      <TableCell className="text-right">{row.value['Quantity'] ?? '-'}</TableCell>
                      <TableCell className="text-right">
                        {row.value['Total Owed']
                          ? `${row.value['Total Owed']} ${row.value['Currency'] ?? ''}`
                          : '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.value['Payment Instrument Type'] ?? '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.value['Shipment Status'] ?? '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      該当する年のデータがありません。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  )
}
