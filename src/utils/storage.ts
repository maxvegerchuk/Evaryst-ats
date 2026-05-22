let memoryStorage: Record<string, string> = {}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return memoryStorage[key] ?? null
    }
  },
  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      memoryStorage[key] = value
    }
  },
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch {
      delete memoryStorage[key]
    }
  },
}
