import { useEffect, useMemo, useState } from 'react'
import AccountSearchDialog from '@/app/_components/AccountSearchDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CsvRow, RowOverrides, Step } from '@/app/types'
import { freeeAccountItems } from '@/data/freeeAccountItems'
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, SearchIcon } from 'lucide-react'

const RECENT_ACCOUNTS_KEY = 'amz2freee:recent-accounts:v1'

type ExportStepProps = {
  step: Step
  handleStepClick: (next: Step) => void
  taxCategory: string
  settlementBase: 'order' | 'ship'
  sourceType: 'amazon' | 'amazon_digital' | 'jcb' | 'orico'
  selectedRows: CsvRow[]
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
      sourceType: 'amazon' | 'amazon_digital' | 'jcb' | 'orico'
    },
  ) => string[]
  inferTaxCategory: (row: CsvRow) => string
  FREEE_HEADERS: string[]
}

export default function ExportStep({
  step,
  handleStepClick,
  taxCategory,
  settlementBase,
  sourceType,
  selectedRows,
  rowOverrides,
  handleOverrideChange,
  handleExportCsv,
  buildFreeeRow,
  inferTaxCategory,
  FREEE_HEADERS,
}: ExportStepProps) {
  const expenseGroup = freeeAccountItems.find((group) => group.large === '費用')
  const accountGroups = expenseGroup ? expenseGroup.middles : []
  const filteredAccountGroups = accountGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !/[()（）]/.test(item.account)),
  }))
  const groupedBySmall = filteredAccountGroups.map((group) => {
    const buckets = new Map<string, typeof group.items>()
    for (const item of group.items) {
      const key = item.small?.trim() || 'その他'
      const list = buckets.get(key)
      if (list) list.push(item)
      else buckets.set(key, [item])
    }
    return {
      middle: group.middle,
      smalls: Array.from(buckets.entries()).map(([small, items]) => ({
        small,
        items,
      })),
    }
  })
  const flatSmallItems: Array<{ small: string; account: string }> = []
  for (const group of filteredAccountGroups) {
    for (const item of group.items) {
      flatSmallItems.push({ small: item.small?.trim() || 'その他', account: item.account })
    }
  }
  const [recentAccounts, setRecentAccounts] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(RECENT_ACCOUNTS_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((value) => typeof value === 'string').slice(0, 5)
      }
    } catch {
      // ignore invalid storage
    }
    return []
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTargets, setDialogTargets] = useState<CsvRow[]>([])
  const [checkedRowIds, setCheckedRowIds] = useState<Set<string>>(() => new Set())
  const [sort, setSort] = useState<{ index: number; direction: 'asc' | 'desc' }>({
    index: 0,
    direction: 'desc',
  })

  useEffect(() => {
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(recentAccounts))
  }, [recentAccounts])

  const pushRecentAccount = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setRecentAccounts((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)]
      return next.slice(0, 5)
    })
  }

  const normalizedCheckedRowIds = useMemo(() => {
    const allowed = new Set(selectedRows.map((row) => row.id))
    const next = new Set<string>()
    for (const id of checkedRowIds) {
      if (allowed.has(id)) next.add(id)
    }
    return next
  }, [checkedRowIds, selectedRows])

  const allChecked = selectedRows.length > 0 && normalizedCheckedRowIds.size === selectedRows.length
  const someChecked = normalizedCheckedRowIds.size > 0 && !allChecked

  const handleToggleAll = () => {
    setCheckedRowIds(() => {
      if (normalizedCheckedRowIds.size === selectedRows.length) return new Set()
      return new Set(selectedRows.map((row) => row.id))
    })
  }

  const handleToggleRow = (row: CsvRow) => {
    setCheckedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(row.id)) next.delete(row.id)
      else next.add(row.id)
      return next
    })
  }

  const openDialogForRows = (rows: CsvRow[]) => {
    if (rows.length === 0) return
    setDialogTargets(rows)
    setDialogOpen(true)
  }

  const displayRows = useMemo(() => {
    return selectedRows.map((row, index) => {
      const cells = buildFreeeRow(row, {
        accountTitle: '',
        taxCategory,
        settlementBase,
        overrides: rowOverrides,
        sourceType,
      })
      const key = row.id || String(index)
      const override = rowOverrides[key] ?? {}
      const overrideTax = override.taxCategory?.trim()
      const baseTax = taxCategory?.trim()
      const taxValue =
        overrideTax && overrideTax.length > 0
          ? overrideTax
          : baseTax && baseTax.length > 0
            ? baseTax
            : (inferTaxCategory(row) ?? '')
      const accountValue = override.accountTitle?.trim() ?? ''
      const displayCells = cells.map((cell, cellIndex) => {
        if (cellIndex === 6) return accountValue || cell
        if (cellIndex === 7) return taxValue || cell
        return cell
      })
      return { row, key, cells, displayCells, accountValue, taxValue }
    })
  }, [
    buildFreeeRow,
    inferTaxCategory,
    rowOverrides,
    selectedRows,
    settlementBase,
    sourceType,
    taxCategory,
  ])

  const sortedRows = useMemo(() => {
    const numericIndices = new Set([8, 10, 20])
    const dateIndices = new Set([2, 3, 18])
    const parseNumber = (value: string | undefined) => {
      if (!value) return 0
      const normalized = value.replace(/,/g, '')
      const num = Number(normalized)
      return Number.isNaN(num) ? 0 : num
    }
    const parseDate = (value: string | undefined) => {
      if (!value) return 0
      const date = new Date(value.replace(/\//g, '-'))
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }
    const next = [...displayRows]
    next.sort((a, b) => {
      const aValue = a.displayCells[sort.index] ?? ''
      const bValue = b.displayCells[sort.index] ?? ''
      let compare = 0
      if (numericIndices.has(sort.index)) {
        compare = parseNumber(String(aValue)) - parseNumber(String(bValue))
      } else if (dateIndices.has(sort.index)) {
        compare = parseDate(String(aValue)) - parseDate(String(bValue))
      } else {
        compare = String(aValue).localeCompare(String(bValue))
      }
      return sort.direction === 'asc' ? compare : -compare
    })
    return next
  }, [displayRows, sort])

  const handleSort = (index: number) => {
    setSort((prev) =>
      prev.index === index
        ? { index, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { index, direction: 'asc' },
    )
  }

  const totalAmount = selectedRows.reduce((sum, row) => {
    const raw = row.value['Total Owed'] ?? ''
    const normalized = raw.replace(/,/g, '')
    const value = Number(normalized)
    if (!Number.isFinite(value)) return sum
    return sum + value
  }, 0)

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
        <section className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold">エクスポートCSVプレビュー</h2>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={normalizedCheckedRowIds.size === 0}
                  onClick={() =>
                    openDialogForRows(
                      selectedRows.filter((row) => normalizedCheckedRowIds.has(row.id)),
                    )
                  }
                >
                  勘定科目の一括設定
                </Button>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {selectedRows.length.toLocaleString()}件 / 合計 ¥
                  {Math.round(totalAmount).toLocaleString('ja-JP')}
                </span>
                <Button onClick={handleExportCsv} disabled={selectedRows.length === 0}>
                  CSVをエクスポート
                </Button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-border">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[48px]">
                      <Checkbox
                        checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                        onCheckedChange={handleToggleAll}
                      />
                    </TableHead>
                    {FREEE_HEADERS.map((header, index) => {
                      const isActive = sort.index === index
                      const Icon = isActive
                        ? sort.direction === 'asc'
                          ? ArrowUpAZ
                          : ArrowDownAZ
                        : ArrowUpDown
                      const alignRight = index === 8 || index === 17
                      return (
                        <TableHead key={header} className={alignRight ? 'text-right' : undefined}>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1 ${
                              alignRight ? 'justify-end w-full' : ''
                            }`}
                            onClick={() => handleSort(index)}
                          >
                            <span>{header}</span>
                            <Icon className="size-4 text-muted-foreground" />
                          </button>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((rowData) => {
                    const { row, key, cells, accountValue, taxValue } = rowData
                    return (
                      <TableRow key={key} onClick={() => handleToggleRow(row)}>
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={normalizedCheckedRowIds.has(row.id)}
                            onCheckedChange={() => handleToggleRow(row)}
                          />
                        </TableCell>
                        {cells.map((cell, cellIndex) => {
                          if (cellIndex === 6) {
                            return (
                              <TableCell key={`${key}-account`}>
                                <div className="flex items-center gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-[200px] justify-between overflow-hidden"
                                      >
                                        <span className="truncate">
                                          {accountValue || '選択'}
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="start"
                                          sideOffset={6}
                                          className="max-h-[60vh] min-w-[240px] overflow-auto"
                                        >
                                          {recentAccounts.length > 0 && (
                                            <>
                                              <DropdownMenuItem
                                                disabled
                                                className="text-xs text-muted-foreground"
                                              >
                                                最近使った
                                              </DropdownMenuItem>
                                              {recentAccounts.map((recent) => (
                                                <DropdownMenuItem
                                                  key={`${key}-recent-${recent}`}
                                                  onSelect={() => {
                                                    handleOverrideChange(
                                                      row,
                                                      'accountTitle',
                                                      recent,
                                                    )
                                                    pushRecentAccount(recent)
                                                  }}
                                                >
                                                  {recent}
                                                </DropdownMenuItem>
                                              ))}
                                              <DropdownMenuItem
                                                disabled
                                                className="h-px bg-border p-0"
                                              />
                                            </>
                                          )}
                                          {groupedBySmall.map((group) => (
                                            <DropdownMenuSub key={`${key}-${group.middle}`}>
                                              <DropdownMenuSubTrigger>
                                                {group.middle}
                                              </DropdownMenuSubTrigger>
                                              <DropdownMenuPortal>
                                                <DropdownMenuSubContent className="max-h-[60vh] min-w-[240px] overflow-auto">
                                                  {group.smalls.map((smallGroup) => (
                                                    <DropdownMenuSub
                                                      key={`${key}-${group.middle}-${smallGroup.small}`}
                                                    >
                                                      <DropdownMenuSubTrigger>
                                                        {smallGroup.small}
                                                      </DropdownMenuSubTrigger>
                                                      <DropdownMenuPortal>
                                                        <DropdownMenuSubContent className="max-h-[60vh] min-w-[240px] overflow-auto">
                                                          {smallGroup.items.map((item) => (
                                                            <DropdownMenuItem
                                                              key={`${key}-${group.middle}-${smallGroup.small}-${item.account}`}
                                                              onSelect={() => {
                                                                handleOverrideChange(
                                                                  row,
                                                                  'accountTitle',
                                                                  item.account,
                                                                )
                                                                pushRecentAccount(item.account)
                                                              }}
                                                            >
                                                              {item.account}
                                                            </DropdownMenuItem>
                                                          ))}
                                                        </DropdownMenuSubContent>
                                                      </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                  ))}
                                                </DropdownMenuSubContent>
                                              </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                          ))}
                                          {filteredAccountGroups.length === 0 && (
                                            <DropdownMenuItem disabled>
                                              候補がありません
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      openDialogForRows([row])
                                    }}
                                  >
                                    <SearchIcon className="size-4" />
                                  </Button>
                                </div>
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
                          const cellClassName =
                            cellIndex === 8 || cellIndex === 17
                              ? 'text-right'
                              : cellIndex === 11
                                ? 'max-w-[400px] truncate'
                                : 'whitespace-nowrap'
                          return (
                            <TableCell key={`${key}-${cellIndex}`} className={cellClassName}>
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
                        colSpan={FREEE_HEADERS.length + 1}
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
          <AccountSearchDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) {
                setDialogTargets([])
              }
            }}
            items={flatSmallItems}
            onSelect={(account) => {
              if (dialogTargets.length === 0) return
              dialogTargets.forEach((target) => {
                handleOverrideChange(target, 'accountTitle', account)
              })
              pushRecentAccount(account)
              setDialogOpen(false)
              setDialogTargets([])
            }}
          />
        </section>
      </div>
    </div>
  )
}
