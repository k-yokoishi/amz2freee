export type CsvRow = Record<string, string>

export type ParsedData = {
  rows: CsvRow[]
  fields: string[]
  fileName: string
}

export type Step = 1 | 2 | 3

export type RowOverrides = Record<string, { accountTitle?: string; taxCategory?: string }>
