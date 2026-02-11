import { useEffect, useState } from 'react'

export function usePersistentState<T>(
  key: string,
  initialValue: T,
) {
  const [value, setValue] = useState<T>(() => {
    const fallback = initialValue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch (error) {
      console.error(`[usePersistentState] failed to read key: ${key}`, error)
      return fallback
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`[usePersistentState] failed to write key: ${key}`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}
