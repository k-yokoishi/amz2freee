import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Step } from '@/features/_shared/types'
import CsvDropzone from '@/app/_components/CsvDropzone'

type UploadStepProps = {
  step: Step
  handleStepClick: (next: Step) => void
  sourceType: 'amazon' | 'amazon_digital' | 'jcb' | 'orico'
  setSourceType: (value: 'amazon' | 'amazon_digital' | 'jcb' | 'orico') => void
  handleFiles: (files: FileList | null) => void
  error: string | null
  uploadedFiles: string[]
  onConfirmUpload: () => void
}

export default function UploadStep({
  step,
  handleStepClick,
  sourceType,
  setSourceType,
  handleFiles,
  error,
  uploadedFiles,
  onConfirmUpload,
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
                クレカ・EC明細をfreee会計CSVへ
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">取引データアップロード</h1>
            </div>
            <Tabs
              value={sourceType}
              onValueChange={(value) =>
                setSourceType(value as 'amazon' | 'amazon_digital' | 'jcb' | 'orico')
              }
            >
              <TabsList className="mx-auto">
                <TabsTrigger value="amazon">Amazon</TabsTrigger>
                <TabsTrigger value="amazon_digital">Amazon電子書籍等</TabsTrigger>
                <TabsTrigger value="jcb">MyJCB</TabsTrigger>
                <TabsTrigger value="orico">Orico</TabsTrigger>
              </TabsList>
              <TabsContent value="amazon">
                <p className="text-sm text-muted-foreground">
                  取得方法はこちら:{' '}
                  <a
                    href="https://aplos.jp/amazon-csv/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    aplos.jp/amazon-csv
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  アップロード対象は{' '}
                  <span className="font-medium text-foreground">Retail.OrderHistory.3.csv</span>{' '}
                  です。
                </p>
              </TabsContent>
              <TabsContent value="amazon_digital">
                <p className="text-sm text-muted-foreground">
                  取得方法はこちら:{' '}
                  <a
                    href="https://aplos.jp/amazon-csv/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    aplos.jp/amazon-csv
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  アップロード対象は{' '}
                  <span className="font-medium text-foreground">
                    Digital-Ordering.3/Digital Items.csv
                  </span>{' '}
                  です。
                </p>
              </TabsContent>
              <TabsContent value="jcb">
                <p className="text-sm text-muted-foreground">
                  MyJCBの明細CSV（複数ファイル可）をアップロードしてください。
                </p>
              </TabsContent>
              <TabsContent value="orico">
                <p className="text-sm text-muted-foreground">
                  Oricoの明細CSV（複数ファイル可）をアップロードしてください。
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <CsvDropzone
            multiple={sourceType === 'jcb' || sourceType === 'orico'}
            onFiles={handleFiles}
            error={error}
          />

          {sourceType === 'jcb' && (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <div className="text-sm font-medium">アップロード済み</div>
              {uploadedFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">まだファイルがありません。</p>
              ) : (
                <ul className="text-sm text-muted-foreground">
                  {uploadedFiles.map((name) => (
                    <li key={name} className="truncate">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <Button onClick={onConfirmUpload} disabled={uploadedFiles.length === 0}>
                  確定して次へ
                </Button>
              </div>
            </div>
          )}

          {sourceType === 'orico' && (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <div className="text-sm font-medium">アップロード済み</div>
              {uploadedFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">まだファイルがありません。</p>
              ) : (
                <ul className="text-sm text-muted-foreground">
                  {uploadedFiles.map((name) => (
                    <li key={name} className="truncate">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <Button onClick={onConfirmUpload} disabled={uploadedFiles.length === 0}>
                  確定して次へ
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
