import { oneDark, color as oneDarkColors } from '@codemirror/theme-one-dark'
import {
  githubLight,
  githubDark,
  vsCodeLight,
  vsCodeDark,
  nord,
} from '@fsegurai/codemirror-theme-bundle'
import type { Extension } from '@codemirror/state'

/** The color palette for a theme, defining various UI colors such as background, foreground, accent, and more */
export interface ThemePalette {
  background: string
  foreground: string
  muted: string
  accent: string
  border: string
  selection: string
  cursor: string
  surface: string
  surfaceElevated: string
  success: string
  error: string
}

/** Represents a theme for the CodeMirror editor, including its ID, label, extension, whether it's dark mode, and its color palette */
export interface Theme {
  id: string
  label: string
  extension: Extension
  dark: boolean
  palette: ThemePalette
}

/** One Dark Theme Palette */
const oneDarkPalette: ThemePalette = {
  background: oneDarkColors.background,
  foreground: oneDarkColors.ivory,
  muted: oneDarkColors.stone,
  accent: oneDarkColors.malibu,
  border: oneDarkColors.highlightBackground,
  selection: oneDarkColors.selection,
  cursor: oneDarkColors.cursor,
  surface: oneDarkColors.darkBackground,
  surfaceElevated: oneDarkColors.tooltipBackground,
  success: '#598e34',
  error: '#e06c75',
}

/** GitHub Light Theme Palette */
const githubLightPalette: ThemePalette = {
  background: '#ffffff',
  foreground: '#24292f',
  muted: '#656d76',
  accent: '#0969da',
  border: '#d0d7de',
  selection: '#cce5ff',
  cursor: '#0969da',
  surface: '#f6f8fa',
  surfaceElevated: '#ffffff',
  success: '#2da44e',
  error: '#cf222e',
}

/** GitHub Dark Theme Palette */
const githubDarkPalette: ThemePalette = {
  background: '#0d1117',
  foreground: '#e6edf3',
  muted: '#8b949e',
  accent: '#58a6ff',
  border: '#30363d',
  selection: '#1f4273',
  cursor: '#58a6ff',
  surface: '#161b22',
  surfaceElevated: '#21262d',
  success: '#3fb950',
  error: '#f85149',
}

/** VS Code Light Theme Palette */
const vsCodeLightPalette: ThemePalette = {
  background: '#ffffff',
  foreground: '#1e1e1e',
  muted: '#6a6a6a',
  accent: '#007acc',
  border: '#e0e0e0',
  selection: '#add6ff',
  cursor: '#007acc',
  surface: '#f3f3f3',
  surfaceElevated: '#ffffff',
  success: '#4ec9b0',
  error: '#f44747',
}

/** VS Code Dark Theme Palette */
const vsCodeDarkPalette: ThemePalette = {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  muted: '#858585',
  accent: '#4fc1ff',
  border: '#3c3c3c',
  selection: '#264f78',
  cursor: '#4fc1ff',
  surface: '#252526',
  surfaceElevated: '#2d2d2d',
  success: '#4ec9b0',
  error: '#f44747',
}

/** Nord Theme Palette */
const nordPalette: ThemePalette = {
  background: '#2e3440',
  foreground: '#d8dee9',
  muted: '#616e88',
  accent: '#88c0d0',
  border: '#3b4252',
  selection: '#3b4252',
  cursor: '#88c0d0',
  surface: '#3b4252',
  surfaceElevated: '#434c5e',
  success: '#a3be8c',
  error: '#bf616a',
}

/** List of all supported themes */
export const themes: Theme[] = [
  {
    id: 'one-dark',
    label: 'One Dark',
    extension: oneDark,
    dark: true,
    palette: oneDarkPalette
  },
  {
    id: 'github-light',
    label: 'GitHub Light',
    extension: githubLight,
    dark: false,
    palette: githubLightPalette
  },
  {
    id: 'github-dark',
    label: 'GitHub Dark',
    extension: githubDark,
    dark: true,
    palette: githubDarkPalette
  },
  {
    id: 'vscode-light',
    label: 'VS Code Light',
    extension: vsCodeLight,
    dark: false,
    palette: vsCodeLightPalette
  },
  {
    id: 'vscode-dark',
    label: 'VS Code Dark',
    extension: vsCodeDark,
    dark: true,
    palette: vsCodeDarkPalette
  },
  {
    id: 'nord',
    label: 'Nord',
    extension: nord,
    dark: true,
    palette: nordPalette
  },
]

/** Type representing the ID of a theme, derived from the list of supported themes */
export type ThemeId = typeof themes[number]['id']
