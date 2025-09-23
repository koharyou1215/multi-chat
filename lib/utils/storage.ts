// Local Storage utilities with SSR safety

export const storage = {
  get: <T>(key: string, fallback?: T): T | undefined => {
    if (typeof window === 'undefined') return fallback

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch (error) {
      // Error reading from localStorage: ${error}
      return fallback
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // Error writing to localStorage: ${error}
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      // Error removing from localStorage: ${error}
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.clear()
    } catch (error) {
      // Error clearing localStorage: ${error}
    }
  }
}