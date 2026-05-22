import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Filter { column: string; value: string }

export function useTable<T extends { id: string }>(
  table: string,
  filter?: Filter,
) {
  const [data, setData]       = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from(table) as any).select('*') as any
      if (filter) query = query.eq(filter.column, filter.value)
      const { data: rows, error } = await query
      if (error) throw error
      if (rows) setData(rows as T[])
    } catch (err) {
      console.error(`useTable(${table}):`, err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch() }, [table])

  const insert = async (row: Partial<T>): Promise<T | undefined> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted, error } = await (supabase.from(table) as any).insert(row).select()
      if (error) throw error
      if (inserted?.[0]) {
        setData(prev => [inserted[0] as T, ...prev])
        return inserted[0] as T
      }
    } catch (err) {
      console.error(`useTable(${table}) insert:`, err)
    }
    return undefined
  }

  const update = async (id: string, updates: Partial<T>): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(table) as any).update(updates).eq('id', id)
      if (error) throw error
      setData(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    } catch (err) {
      console.error(`useTable(${table}) update:`, err)
    }
  }

  const remove = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      setData(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(`useTable(${table}) delete:`, err)
    }
  }

  return { data, loading, insert, update, remove, refetch: fetch }
}
