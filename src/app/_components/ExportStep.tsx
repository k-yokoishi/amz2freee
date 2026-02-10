import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { SearchIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  const groupedBySmall = accountGroups.map((group) => {
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
  for (const group of accountGroups) {
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
  const [dialogSearch, setDialogSearch] = useState('')
  const [dialogRow, setDialogRow] = useState<CsvRow | null>(null)

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

  const dialogQuery = dialogSearch.trim().toLowerCase()
  const dialogCandidates = dialogQuery
    ? flatSmallItems.filter((item) => {
        return (
          item.small.toLowerCase().includes(dialogQuery) ||
          item.account.toLowerCase().includes(dialogQuery)
        )
      })
    : flatSmallItems

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
                <span>全件表示</span>
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
                  {selectedRows.map((row, index) => {
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
                    return (
                      <TableRow key={key}>
                        {cells.map((cell, cellIndex) => {
                          if (cellIndex === 6) {
                            const accountValue = override.accountTitle?.trim() ?? ''
                            return (
                              <TableCell key={`${key}-account`}>
                                <div className="flex items-center gap-2">
                                  <TooltipProvider>
                                    <Tooltip delayDuration={200}>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 w-[200px] justify-between overflow-hidden"
                                            >
                                              <span className="truncate">
                                                {accountValue || '選択'}
                                              </span>
                                            </Button>
                                          </TooltipTrigger>
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
                                          {accountGroups.length === 0 && (
                                            <DropdownMenuItem disabled>
                                              候補がありません
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                      <TooltipContent>{accountValue || '選択'}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setDialogRow(row)
                                      setDialogSearch('')
                                      setDialogOpen(true)
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
                          return (
                            <TableCell
                              key={`${key}-${cellIndex}`}
                              className={
                                cellIndex === 8 || cellIndex === 17
                                  ? 'text-right'
                                  : 'whitespace-nowrap'
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
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) {
                setDialogRow(null)
              }
            }}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>勘定科目を検索して選択</DialogTitle>
                <DialogDescription>
                  小分類がフラットに並びます。インクリメンタル検索できます。
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="小分類 / 勘定科目で検索"
                  value={dialogSearch}
                  onChange={(event) => setDialogSearch(event.target.value)}
                />
                <div className="max-h-[50vh] overflow-auto rounded-md border">
                  <div className="grid grid-cols-1 gap-1 p-2">
                    {dialogCandidates.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        該当する項目がありません。
                      </div>
                    )}
                    {dialogCandidates.map((item, idx) => (
                      <button
                        key={`${item.small}-${item.account}-${idx}`}
                        type="button"
                        className="hover:bg-muted/60 flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm"
                        onClick={() => {
                          if (!dialogRow) return
                          handleOverrideChange(dialogRow, 'accountTitle', item.account)
                          pushRecentAccount(item.account)
                          setDialogOpen(false)
                          setDialogRow(null)
                        }}
                      >
                        <span className="text-muted-foreground">{item.small}</span>
                        <span className="text-foreground">{item.account}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  )
}
