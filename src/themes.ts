import {
    githubLight,
    githubDark,
    vsCodeLight,
    vsCodeDark,
    gruvboxLight,
    gruvboxDark,
    nord,
    monokai,
    abcdef,
} from '@fsegurai/codemirror-theme-bundle'
import { oneDark } from '@codemirror/theme-one-dark'

/** Represents a theme for the CodeMirror editor */
export interface Theme {
    /** Unique identifier for the theme */
    id: string
    /** Display name for the theme */
    label: string
    /** The CodeMirror extension that applies the theme */
    extension: any
    /** Indicates whether the theme is dark or light */
    dark: boolean
}

/** List of available themes */
export const themes: Theme[] = [
    { id: 'github-light', label: 'GitHub Light', extension: githubLight, dark: false },
    { id: 'github-dark', label: 'GitHub Dark', extension: githubDark, dark: true },
    { id: 'vscode-light', label: 'VS Code Light', extension: vsCodeLight, dark: false },
    { id: 'vscode-dark', label: 'VS Code Dark', extension: vsCodeDark, dark: true },
    { id: 'one-dark', label: 'One Dark', extension: oneDark, dark: true },
    { id: 'nord', label: 'Nord', extension: nord, dark: true },
    { id: 'monokai', label: 'Monokai', extension: monokai, dark: true },
    { id: 'abcdef', label: 'abcdef', extension: abcdef, dark: true },
    { id: 'gruvbox-light', label: 'Gruvbox Light', extension: gruvboxLight, dark: false },
    { id: 'gruvbox-dark', label: 'Gruvbox Dark', extension: gruvboxDark, dark: true },
]

/** Type representing the unique identifier of a theme */
export type ThemeId = typeof themes[number]['id']
