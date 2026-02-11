import { useEffect, useMemo, useState } from 'react'
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
import type { CsvRow, Step } from '@/features/_shared/types'
import { countSelectedRows } from '@/features/selection/countSelectedRows'
import { extractYears } from '@/features/selection/extractYears'
import { filterRows } from '@/features/selection/filterRows'
import { usePersistentState } from '@/features/_shared/utils/hooks/usePersistentState'
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from 'lucide-react'

const SELECTED_YEAR_STORAGE_KEY = 'amz2freee:selected-year:v1'

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

type SelectStepProps = {
  step: Step
  handleStepClick: (next: Step) => void
  rows: CsvRow[]
  selectedKeys: Set<string>
  setSelectedKeys: (next: Set<string>) => void
  onGoToExport: () => void
}

export default function SelectStep({
  step,
  handleStepClick,
  rows,
  selectedKeys,
  setSelectedKeys,
  onGoToExport,
}: SelectStepProps) {
  const [selectedYear, setSelectedYear] = usePersistentState<string>(
    SELECTED_YEAR_STORAGE_KEY,
    'all',
  )
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'Order Date',
    direction: 'desc',
  })
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  const years = useMemo(() => extractYears(rows), [rows])
  const activeSelectedYear =
    selectedYear === 'all' || years.includes(selectedYear) ? selectedYear : 'all'

  const filteredRows = useMemo(
    () => filterRows(rows, activeSelectedYear, debouncedSearchQuery),
    [rows, activeSelectedYear, debouncedSearchQuery],
  )

  const selectedCount = useMemo(
    () => countSelectedRows(filteredRows, selectedKeys),
    [filteredRows, selectedKeys],
  )

  const allVisibleSelected = filteredRows.length > 0 && selectedCount === filteredRows.length
  const someVisibleSelected = selectedCount > 0 && selectedCount < filteredRows.length

  const columns: Array<{
    label: string
    key: string
    type: 'string' | 'number' | 'date'
    align?: 'right'
  }> = useMemo(
    () => [
      { label: '注文日', key: 'Order Date', type: 'date' },
      { label: '注文ID', key: 'Order ID', type: 'string' },
      { label: '商品名', key: 'Product Name', type: 'string' },
      { label: '数量', key: 'Quantity', type: 'number', align: 'right' },
      { label: '金額', key: 'Total Owed', type: 'number', align: 'right' },
      { label: '支払い', key: 'Payment Instrument Type', type: 'string' },
      { label: '配送状況', key: 'Shipment Status', type: 'string' },
    ],
    [],
  )

  const parseNumber = (value: string | undefined) => {
    if (!value) return null
    const normalized = value.replace(/,/g, '')
    const num = Number(normalized)
    return Number.isNaN(num) ? null : num
  }

  const parseDate = (value: string | undefined) => {
    if (!value) return null
    const date = new Date(value.replace(/\//g, '-'))
    return Number.isNaN(date.getTime()) ? null : date.getTime()
  }

  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.key === sort.key)
    if (!column) return filteredRows
    const next = [...filteredRows]
    next.sort((a, b) => {
      const aValue = a.value[column.key] ?? ''
      const bValue = b.value[column.key] ?? ''
      let compare = 0
      if (column.type === 'number') {
        const aNum = parseNumber(aValue) ?? 0
        const bNum = parseNumber(bValue) ?? 0
        compare = aNum - bNum
      } else if (column.type === 'date') {
        const aDate = parseDate(aValue) ?? 0
        const bDate = parseDate(bValue) ?? 0
        compare = aDate - bDate
      } else {
        compare = String(aValue).localeCompare(String(bValue))
      }
      return sort.direction === 'asc' ? compare : -compare
    })
    return next
  }, [columns, filteredRows, sort])

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }

  const handleToggleAll = () => {
    const next = new Set(selectedKeys)
    if (allVisibleSelected) {
      for (const row of filteredRows) next.delete(row.id)
    } else {
      for (const row of filteredRows) next.add(row.id)
    }
    setSelectedKeys(next)
  }

  const handleRowToggle = (row: CsvRow) => {
    const next = new Set(selectedKeys)
    if (next.has(row.id)) next.delete(row.id)
    else next.add(row.id)
    setSelectedKeys(next)
  }

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
              <h2 className="text-lg font-semibold">エクスポート対象の選択</h2>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {selectedCount.toLocaleString()}/{filteredRows.length.toLocaleString()}選択中
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-3">
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
                  <Select value={activeSelectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      align="start"
                      sideOffset={6}
                      className="z-[100]"
                    >
                      <SelectItem value="all">全期間</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  {columns.map((column) => {
                    const isActive = sort.key === column.key
                    const Icon = isActive
                      ? sort.direction === 'asc'
                        ? ArrowUpAZ
                        : ArrowDownAZ
                      : ArrowUpDown
                    return (
                      <TableHead
                        key={column.key}
                        className={column.align === 'right' ? 'text-right' : undefined}
                      >
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1 ${
                            column.align === 'right' ? 'justify-end w-full' : ''
                          }`}
                          onClick={() => handleSort(column.key)}
                        >
                          <span>{column.label}</span>
                          <Icon className="size-4 text-muted-foreground" />
                        </button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row, index) => {
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
                      <TableCell className="whitespace-nowrap">
                        {row.value['Order Date'] ?? '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.value['Order ID'] ?? '-'}
                      </TableCell>
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
      </div>
    </div>
  )
}
