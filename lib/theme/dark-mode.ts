"use client"

export interface ThemeColors {
  // Primary colors
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  
  // Background colors
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  
  // UI element colors
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  
  // Orange theme specific
  orange: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
}

export const lightTheme: ThemeColors = {
  primary: "hsl(24 95% 53%)", // Orange-500
  primaryForeground: "hsl(0 0% 98%)",
  secondary: "hsl(210 40% 96%)",
  secondaryForeground: "hsl(222.2 84% 4.9%)",
  
  background: "hsl(0 0% 100%)",
  foreground: "hsl(222.2 84% 4.9%)",
  card: "hsl(0 0% 100%)",
  cardForeground: "hsl(222.2 84% 4.9%)",
  popover: "hsl(0 0% 100%)",
  popoverForeground: "hsl(222.2 84% 4.9%)",
  
  muted: "hsl(210 40% 96%)",
  mutedForeground: "hsl(215.4 16.3% 46.9%)",
  accent: "hsl(210 40% 96%)",
  accentForeground: "hsl(222.2 84% 4.9%)",
  destructive: "hsl(0 84.2% 60.2%)",
  destructiveForeground: "hsl(210 40% 98%)",
  border: "hsl(214.3 31.8% 91.4%)",
  input: "hsl(214.3 31.8% 91.4%)",
  ring: "hsl(24 95% 53%)",
  
  orange: {
    50: "hsl(33 100% 96%)",
    100: "hsl(34 100% 92%)",
    200: "hsl(32 98% 83%)",
    300: "hsl(31 97% 72%)",
    400: "hsl(27 96% 61%)",
    500: "hsl(24 95% 53%)",
    600: "hsl(20 91% 48%)",
    700: "hsl(17 88% 40%)",
    800: "hsl(15 79% 34%)",
    900: "hsl(15 75% 28%)",
    950: "hsl(15 80% 15%)"
  }
}

export const darkTheme: ThemeColors = {
  primary: "hsl(24 95% 53%)", // Keep orange primary
  primaryForeground: "hsl(210 40% 98%)",
  secondary: "hsl(217.2 32.6% 17.5%)",
  secondaryForeground: "hsl(210 40% 98%)",
  
  background: "hsl(222.2 84% 4.9%)",
  foreground: "hsl(210 40% 98%)",
  card: "hsl(222.2 84% 4.9%)",
  cardForeground: "hsl(210 40% 98%)",
  popover: "hsl(222.2 84% 4.9%)",
  popoverForeground: "hsl(210 40% 98%)",
  
  muted: "hsl(217.2 32.6% 17.5%)",
  mutedForeground: "hsl(215 20.2% 65.1%)",
  accent: "hsl(217.2 32.6% 17.5%)",
  accentForeground: "hsl(210 40% 98%)",
  destructive: "hsl(0 62.8% 30.6%)",
  destructiveForeground: "hsl(210 40% 98%)",
  border: "hsl(217.2 32.6% 17.5%)",
  input: "hsl(217.2 32.6% 17.5%)",
  ring: "hsl(24 95% 53%)",
  
  orange: {
    50: "hsl(15 80% 15%)",
    100: "hsl(15 75% 28%)",
    200: "hsl(15 79% 34%)",
    300: "hsl(17 88% 40%)",
    400: "hsl(20 91% 48%)",
    500: "hsl(24 95% 53%)",
    600: "hsl(27 96% 61%)",
    700: "hsl(31 97% 72%)",
    800: "hsl(32 98% 83%)",
    900: "hsl(34 100% 92%)",
    950: "hsl(33 100% 96%)"
  }
}

export const generateCSSVariables = (theme: ThemeColors): Record<string, string> => {
  return {
    '--background': theme.background,
    '--foreground': theme.foreground,
    '--card': theme.card,
    '--card-foreground': theme.cardForeground,
    '--popover': theme.popover,
    '--popover-foreground': theme.popoverForeground,
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--secondary': theme.secondary,
    '--secondary-foreground': theme.secondaryForeground,
    '--muted': theme.muted,
    '--muted-foreground': theme.mutedForeground,
    '--accent': theme.accent,
    '--accent-foreground': theme.accentForeground,
    '--destructive': theme.destructive,
    '--destructive-foreground': theme.destructiveForeground,
    '--border': theme.border,
    '--input': theme.input,
    '--ring': theme.ring,
    '--radius': '0.5rem',
    
    // Orange scale variables
    '--orange-50': theme.orange[50],
    '--orange-100': theme.orange[100],
    '--orange-200': theme.orange[200],
    '--orange-300': theme.orange[300],
    '--orange-400': theme.orange[400],
    '--orange-500': theme.orange[500],
    '--orange-600': theme.orange[600],
    '--orange-700': theme.orange[700],
    '--orange-800': theme.orange[800],
    '--orange-900': theme.orange[900],
    '--orange-950': theme.orange[950],
  }
}

export const applyTheme = (theme: ThemeColors) => {
  const variables = generateCSSVariables(theme)
  const root = document.documentElement
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}