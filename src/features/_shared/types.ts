export type CsvRow = {
  id: string
  value: Record<string, string>
}

export type SourceType = 'amazon' | 'amazon_digital' | 'jcb' | 'orico'

export type ParsedData = {
  rows: CsvRow[]
  fields: string[]
  fileName: string
  sourceType: SourceType
}

export type Step = 1 | 2 | 3

export type RowOverrides = Record<string, { accountTitle?: string; taxCategory?: string }>

export type ParsedUpload = {
  name: string
  rows: CsvRow[]
  fields: string[]
}

export type SourceFilesParser = (files: FileList) => Promise<ParsedUpload[]>
