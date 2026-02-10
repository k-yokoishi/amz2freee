import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type AccountSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Array<{ small: string; account: string }>
  onSelect: (account: string) => void
}

export default function AccountSearchDialog({
  open,
  onOpenChange,
  items,
  onSelect,
}: AccountSearchDialogProps) {
  const [search, setSearch] = useState('')

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) => {
      return (
        item.small.toLowerCase().includes(query) ||
        item.account.toLowerCase().includes(query)
      )
    })
  }, [items, search])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          setSearch('')
        }
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>勘定科目を検索して選択</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="小分類 / 勘定科目で検索"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-h-[50vh] overflow-auto rounded-md border">
            <div className="grid grid-cols-1 gap-1 p-2">
              {candidates.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  該当する項目がありません。
                </div>
              )}
              {candidates.map((item, idx) => (
                <button
                  key={`${item.small}-${item.account}-${idx}`}
                  type="button"
                  className="hover:bg-muted/60 flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm"
                  onClick={() => onSelect(item.account)}
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
  )
}
