import { themes, type Theme, type ThemeId, type ThemePalette } from './themes'

/** Applies the given theme palette to the document by setting CSS variables for each color in the palette and updating the body's data-theme attribute */
function applyThemePalette(theme: { palette: ThemePalette; dark: boolean }) {
    const root = document.documentElement
    Object.entries(theme.palette).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value)
    })
    document.body.dataset.theme = theme.dark ? 'dark' : 'light'
}

/** Determines the initial theme based on user preference or system preference */
function getInitialTheme(): { theme: typeof themes[0]; isSystemPreference: boolean } {
    const savedTheme = localStorage.getItem('theme') as ThemeId | null
    if (savedTheme) {
        const theme = themes.find(t => t.id === savedTheme) || themes[0]
        return { theme, isSystemPreference: false }
    }
    // No saved preference - use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const fallbackTheme = themes.find(t => t.dark === prefersDark) || themes[0]
    return { theme: fallbackTheme, isSystemPreference: true }
}

/**
 * Populates the dropdown, paints the initial palette, and fires
 * `onThemeChange` whenever then user (or OS) picks a new theme.
 * Returns the resolved initial theme for the caller to pass to the editor
 */
export function initializeThemePicker(onThemeChange: (theme: Theme) => void): Theme {
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement
    const { theme: initialTheme } = getInitialTheme()

    // Populate dropdown
    themes.forEach(theme => {
        const opt = document.createElement('option')
        opt.value = theme.id
        opt.textContent = theme.label
        if (theme.id === initialTheme.id) {
            opt.selected = true
        }
        themeSelect.appendChild(opt)
    })

    applyThemePalette(initialTheme)

    // Dropdown change -> palette + editor + save
    themeSelect.addEventListener('change', (event) => {
        const theme = themes.find(t => t.id === (event.target as HTMLSelectElement).value)
        if (!theme) { return }
        applyThemePalette(theme)
        onThemeChange(theme)
        localStorage.setItem('theme', theme.id) // Save the selected theme to localStorage for persistence across sessions
    })

    // System preference listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const prefersDark = e.matches
            const theme = themes.find(t => t.dark === prefersDark) || themes[0]
            applyThemePalette(theme)
            onThemeChange(theme)
            themeSelect.value = theme.id
        }
    })

    return initialTheme
}
