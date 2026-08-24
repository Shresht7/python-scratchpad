import { loadMicroPython } from '@micropython/micropython-webassembly-pyscript'

import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"

import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"

import { Compartment } from "@codemirror/state"
import { themes, type ThemeId, type ThemePalette } from './themes'

import "./style.css"

import { createIcons, Play, PanelBottom, PanelRight, Trash2, Copy } from 'lucide'

createIcons({
  icons: {
    Play,
    PanelBottom,
    PanelRight,
    Trash2,
    Copy
  }
})

// Initialize MicroPython and setup where to display stdout and stderr
const micropython = await loadMicroPython({
  stdout: (text: string) => display(text, false),
  stderr: (text: string) => display(text, true),
})

/** The main element that contains the source code input and output display */
const main = document.getElementsByTagName('main')[0]

/** The div where the source code will be entered */
const sourceCode = document.getElementById("source-code") as HTMLDivElement
/** The div where the output of the Python code will be displayed */
const displayOutput = document.getElementById("display-output") as HTMLDivElement

/** The button to toggle the layout of the main element between horizontal and vertical */
const toggleLayoutButton = document.getElementById('toggle-layout') as HTMLButtonElement

/** The button to run the Python code */
const runButton = document.getElementById("run-button") as HTMLButtonElement

/** Returns the platform-appropriate modifier key label */
function getModifierKey(): string {
  return navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'
}

// Set the tooltip with platform-specific modifier key
runButton.title = `Run (${getModifierKey()}+Enter)`

// Register event listener for the run button to execute the Python code and display the output
runButton.addEventListener("click", runCode)

/** Executes the Python code entered by the user in the textarea and displays the output in the designated div */
function runCode() {
  // Get the Python code from the textarea
  const src = editor.state.doc.toString()
  if (!src) { return }

  clearOutput() // Clear previous output before running new code

  // Run the Python code using the MicroPython instance and handle any errors that may occur
  try {
    micropython.runPython(src)
  } catch (error) {
    console.error(error)
    display(`Error: ${error}`, true)
  }
}

/** Displays the given text in the designated output div */
function display(text: string, isError = false) {
  const span = document.createElement('span')
  if (isError) {
    span.className = 'output-error'
  }
  span.textContent = text + '\n'
  displayOutput.appendChild(span)
}

/** Clears the output div to remove any previous output */
function clearOutput() {
  displayOutput.innerText = ""
}

/** Sets up a keymap extension for the CodeMirror editor, including running the code with "Mod-Enter"/"Shift-Enter" and indenting with Tab */
const keymapExtension = keymap.of([
  indentWithTab,
  {
    key: "Mod-Enter",
    run: () => {
      runCode()
      return true
    }
  },
  {
    key: "Shift-Enter",
    run: () => {
      runCode()
      return true
    }
  }
])

/** Toggles the layout of the main element between horizontal and vertical by changing its data-layout attribute and dispatching a layout-change event */
function toggleLayout() {
  const currentLayout = main.getAttribute('data-layout')
  const newLayout = currentLayout === 'horizontal' ? 'vertical' : 'horizontal'
  main.setAttribute('data-layout', newLayout)
  localStorage.setItem('layout', newLayout) // Save the selected layout to localStorage for persistence across sessions
}

// Register event listener for the toggle layout button to switch between horizontal and vertical layouts
toggleLayoutButton.addEventListener('click', toggleLayout)

/** Sets up a theme extension for the CodeMirror editor to ensure it takes up the full height of its container and allows scrolling */
const themeExtension = EditorView.theme({
  "&": { height: "100%", position: 'relative' },
  ".cm-scroller": { overflow: "auto", position: 'absolute', inset: 0 },
  ".cm-lineNumbers": { minWidth: "3ch" },
})

const themeCompartment = new Compartment()

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

const { theme: initialTheme } = getInitialTheme()

const savedLayout = localStorage.getItem('layout') || 'horizontal'
main.setAttribute('data-layout', savedLayout)

/** Applies the given theme palette to the document by setting CSS variables for each color in the palette and updating the body's data-theme attribute */
function applyThemePalette(theme: { palette: ThemePalette; dark: boolean }) {
  const root = document.documentElement
  Object.entries(theme.palette).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value)
  })
  document.body.dataset.theme = theme.dark ? 'dark' : 'light'
}

applyThemePalette(initialTheme)

/** Initializes the CodeMirror editor with the specified extensions and attaches it to the designated parent element */
const editor = new EditorView({
  doc: '',
  extensions: [
    keymapExtension,
    basicSetup,
    python(),
    themeExtension,
    themeCompartment.of(initialTheme.extension)
  ],
  parent: sourceCode
})

// Populate Theme Selection Dropdown
const themeSelect = document.getElementById('theme-select') as HTMLSelectElement

themes.forEach(theme => {
  const opt = document.createElement('option')
  opt.value = theme.id
  opt.textContent = theme.label
  if (theme.id === initialTheme.id) {
    opt.selected = true
  }
  themeSelect.appendChild(opt)
})

// Register event listener for the theme selection dropdown to change the editor's theme based on user selection
themeSelect.addEventListener('change', (event) => {
  const theme = themes.find(t => t.id === (event.target as HTMLSelectElement).value)
  if (!theme) { return }

  editor.dispatch({
    effects: themeCompartment.reconfigure(theme.extension)
  })

  applyThemePalette(theme)
  localStorage.setItem('theme', theme.id) // Save the selected theme to localStorage for persistence across sessions
})

// Listen for system theme changes and update if user hasn't set a preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    const prefersDark = e.matches
    const theme = themes.find(t => t.dark === prefersDark) || themes[0]
    applyThemePalette(theme)
    editor.dispatch({ effects: themeCompartment.reconfigure(theme.extension) })
    themeSelect.value = theme.id
  }
})
