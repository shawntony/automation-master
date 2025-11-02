import { useCallback, useState } from 'react'

/**
 * Custom hook for managing array state with common CRUD operations.
 * Provides memoized handlers to prevent unnecessary re-renders.
 */
export function useArrayState<T extends { id: string }>(initialValue: T[]) {
  const [items, setItems] = useState<T[]>(initialValue)

  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }, [])

  const replaceItems = useCallback((newItems: T[]) => {
    setItems(newItems)
  }, [])

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    replaceItems
  }
}

/**
 * Custom hook for managing simple array state (strings, numbers).
 * Provides memoized handlers for add/remove operations.
 */
export function useSimpleArrayState<T>(initialValue: T[]) {
  const [items, setItems] = useState<T[]>(initialValue)

  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item])
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateItem = useCallback((index: number, value: T) => {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }, [])

  const toggleItem = useCallback((item: T) => {
    setItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }, [])

  const replaceItems = useCallback((newItems: T[]) => {
    setItems(newItems)
  }, [])

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    toggleItem,
    replaceItems
  }
}
