import { useRef, useState, type DragEventHandler } from 'react'
import { Button } from '@/components/ui/button'

type CsvDropzoneProps = {
  multiple: boolean
  onFiles: (files: FileList | null) => void
  error: string | null
}

export default function CsvDropzone({ multiple, onFiles, error }: CsvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setIsDragging(false)
    onFiles(event.dataTransfer.files)
  }

  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave: DragEventHandler<HTMLDivElement> = () => {
    setIsDragging(false)
  }

  return (
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
        multiple={multiple}
        onChange={(event) => onFiles(event.target.files)}
        className="hidden"
      />
      <Button onClick={() => inputRef.current?.click()}>CSVファイルを選択</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
