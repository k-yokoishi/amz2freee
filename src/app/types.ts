export type CsvRow = Record<string, string>

export type SourceType = 'amazon' | 'jcb'

export type ParsedData = {
  rows: CsvRow[]
  fields: string[]
  fileName: string
  sourceType: SourceType
}

export type Step = 1 | 2 | 3

export type RowOverrides = Record<string, { accountTitle?: string; taxCategory?: string }>
