export function normalizeHeader(value: string): string {
  return value
    .replace(/^\ufeff/, '')
    .replace(/^"|"$/g, '')
    .trim()
}
