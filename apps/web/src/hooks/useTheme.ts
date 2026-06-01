import { useState, useEffect, useCallback } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // Lazy initial state avoids calling setState inside useEffect
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vigil_theme')
      return (stored === 'light' || stored === 'dark') ? stored : 'dark'
    }
    return 'dark'
  })

  // Apply theme to document element reactively
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vigil_theme', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}
