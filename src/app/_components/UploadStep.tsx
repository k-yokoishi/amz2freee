import type { DragEventHandler, RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Step } from '@/app/types'

type UploadStepProps = {
  step: Step
  handleStepClick: (next: Step) => void
  sourceType: 'amazon' | 'jcb'
  setSourceType: (value: 'amazon' | 'jcb') => void
  isDragging: boolean
  handleDrop: DragEventHandler<HTMLDivElement>
  handleDragOver: DragEventHandler<HTMLDivElement>
  handleDragLeave: DragEventHandler<HTMLDivElement>
  inputRef: RefObject<HTMLInputElement | null>
  handleFiles: (files: FileList | null) => void
  error: string | null
  jcbFiles: string[]
  onConfirmJcb: () => void
}

export default function UploadStep({
  step,
  handleStepClick,
  sourceType,
  setSourceType,
  isDragging,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  inputRef,
  handleFiles,
  error,
  jcbFiles,
  onConfirmJcb,
}: UploadStepProps) {
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
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-4 text-center">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Amazon / MyJCB → freee会計CSV
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">取引データアップロード</h1>
            </div>
            <Tabs value={sourceType} onValueChange={(value) => setSourceType(value as 'amazon' | 'jcb')}>
              <TabsList className="mx-auto">
                <TabsTrigger value="amazon">Amazon</TabsTrigger>
                <TabsTrigger value="jcb">MyJCB</TabsTrigger>
              </TabsList>
              <TabsContent value="amazon">
                <p className="text-sm text-muted-foreground">
                  アップロード対象は{' '}
                  <span className="font-medium text-foreground">Retail.OrderHistory.3.csv</span>{' '}
                  です。
                </p>
              </TabsContent>
              <TabsContent value="jcb">
                <p className="text-sm text-muted-foreground">
                  MyJCBの明細CSV（複数ファイル可）をアップロードしてください。
                </p>
              </TabsContent>
            </Tabs>
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
              multiple={sourceType === 'jcb'}
              onChange={(event) => handleFiles(event.target.files)}
              className="hidden"
            />
            <Button onClick={() => inputRef.current?.click()}>
              {sourceType === 'jcb' ? 'CSVを追加' : 'CSVを選択'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {sourceType === 'jcb' && (
            <div className="mt-6 flex flex-col gap-3 text-left">
              <div className="text-sm font-medium">アップロード済み</div>
              {jcbFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">まだファイルがありません。</p>
              ) : (
                <ul className="text-sm text-muted-foreground">
                  {jcbFiles.map((name) => (
                    <li key={name} className="truncate">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <Button onClick={onConfirmJcb} disabled={jcbFiles.length === 0}>
                  アップロード確定して次へ
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
