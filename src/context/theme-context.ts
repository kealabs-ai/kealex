import { createContext } from 'react'

export type Theme = 'dark' | 'light'

export interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  isDark: boolean
}

export const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue)
