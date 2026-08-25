import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"

import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"

import { Compartment } from "@codemirror/state"
import { themes, type ThemeId, type ThemePalette } from './themes'

import "./style.css"

import type { WorkerToMain } from "./worker"

import { writeCodeToHash, decodeHashFragmentToCode, HASH_UPDATE_DEBOUNCE_MS } from "./share"

import './ui/icons'

/** Creates a MicroPython worker and wires up its message handling */
function createWorker(): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

  worker.addEventListener('message', (event: MessageEvent<WorkerToMain>) => {
    const message = event.data
    switch (message.type) {
      case 'ready':
        workerIsReady = true
        updateRunButtonState()
        break
      case 'stdout':
        display(message.text)
        break
      case 'stderr':
        display(message.text, true)
        break
      case 'done':
        if (message.id === runId) {
          workerIsRunning = false
          updateRunButtonState()
        }
        break
      case 'error':
        if (message.id === runId) {
          workerIsRunning = false
          updateRunButtonState()
          display(`Error: ${message.message}`, true)
        }
        break
    }
  })

  // If the worker itself fails to load, surface it instead of failing silently
  worker.addEventListener('error', (event) => {
    display(`Interpreter failed to load. Try reloading the page. Error: ${event.message}`, true)
    console.error(event)
  })

  return worker
}

/** The worker that runs the MicroPython interpreter in a separate thread */
let worker = createWorker()

/** Whether the interpreter has finished loading and can accept code */
let workerIsReady = false

/** Whether Python code is currently executing */
let workerIsRunning = false

/** Monotonic id assigned to each run request */
let runId = 0

/** The main element that contains the source code input and output display */
const main = document.getElementsByTagName('main')[0]

/** The div where the source code will be entered */
const sourceCode = document.getElementById("source-code") as HTMLDivElement
/** The div where the output of the Python code will be displayed */
const displayOutput = document.getElementById("display-output") as HTMLDivElement

/** The draggable divider between the code and the output panels */
const divider = document.getElementById("divider") as HTMLDivElement

/** The button to toggle the layout of the main element between horizontal and vertical */
const toggleLayoutButton = document.getElementById('toggle-layout') as HTMLButtonElement

/** The button to run the Python code */
const runButton = document.getElementById("run-button") as HTMLButtonElement

/** The label inside the run/stop button */
const runLabel = document.getElementById("run-label") as HTMLSpanElement

/** Returns the platform-appropriate modifier key label */
function getModifierKey(): string {
  return navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'
}

// Set the tooltip with platform-specific modifier key
runButton.title = `Run (${getModifierKey()}+Enter)`

// Register event listener for the run button to execute the Python code and display the output
runButton.addEventListener("click", () => {
  if (workerIsRunning) {
    stopExecution()
  } else {
    runCode()
  }
})

/** Updates the state of the run button based on whether the code is executing */
function updateRunButtonState() {
  runButton.disabled = !workerIsReady
  if (workerIsRunning) {
    runButton.classList.add('running')
    runButton.title = 'Stop Execution'
    runLabel.textContent = 'Stop'
  } else {
    runButton.classList.remove('running')
    runButton.title = `Run (${getModifierKey()}+Enter)`
    runLabel.textContent = 'Run'
  }
}

updateRunButtonState() // Initial state of the run button

/** The button to clear the output display */
const clearButton = document.getElementById("clear-output") as HTMLButtonElement

// Register event listener for the clear button to empty the output display
clearButton.addEventListener("click", clearOutput)

/** The buttons to copy the source code and the output to the clipboard */
const copyCodeButton = document.getElementById("copy-code") as HTMLButtonElement
const copyOutputButton = document.getElementById("copy-output") as HTMLButtonElement

/** How long the copied checkmark feedback stays visible on a copy button */
const COPY_FEEDBACK_MS = 1000

/** Bounds and default for the panel split percentage */
const SPLIT_MIN = 15
const SPLIT_MAX = 85
const SPLIT_DEFAULT = 66.67

/** The current split percentage between the code and output panels */
let panelSplit = SPLIT_DEFAULT

/** Whether a divider drag is in progress */
let isDraggingDivider = false

/** Pointer position and split percentage when the current drag started */
let dragStartPointer = 0
let dragStartSplit = 0

/** Reads the saved split percentage for a layout, falling back to the default */
function loadSplit(layout: 'horizontal' | 'vertical'): number {
  const split = Number(localStorage.getItem(`split-${layout}`))
  return Number.isFinite(split) && split > 0 ? Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, split)) : SPLIT_DEFAULT
}

/** Persist the given split percentage for a layout */
function saveSplit(layout: 'horizontal' | 'vertical', split: number) {
  localStorage.setItem(`split-${layout}`, String(split))
}

/** Applies the split percentage to the main element's --split variable */
function applySplit(percentage: number) {
  main.style.setProperty('--panel-split', `${percentage}%`)
  panelSplit = percentage
}

/** Copies the given text to the clipboard and briefly swaps the button's icon to a checkmark */
async function copyText(text: string, button: HTMLButtonElement) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error(error)
    return
  }

  button.classList.add('copied')

  // Restart the feedback timer if the button is clicked again while feedback is showing
  const previousTimer = Number(button.dataset.timer ?? 0)
  if (previousTimer) { window.clearTimeout(previousTimer) }

  button.dataset.timer = String(window.setTimeout(() => {
    button.classList.remove('copied')
    delete button.dataset.timer
  }, COPY_FEEDBACK_MS))
}

// Register event listeners for the copy buttons to copy the source code and the output respectively
copyCodeButton.addEventListener("click", () => copyText(editor.state.doc.toString(), copyCodeButton))
copyOutputButton.addEventListener("click", () => copyText(displayOutput.innerText, copyOutputButton))

/** Executes the Python code entered by the user in the textarea and displays the output in the designated div */
function runCode() {
  if (!workerIsReady || workerIsRunning) { return }

  // Get the Python code from the textarea
  const src = editor.state.doc.toString()
  if (!src) { return }

  clearOutput() // Clear previous output before running new code

  // Mark that the worker is now running code and update the run button state
  workerIsRunning = true
  updateRunButtonState()

  // Send a message to the worker to run the Python code
  worker.postMessage({ type: 'run', id: ++runId, src })
}

/** Terminates the worker to interrupt any running code and starts a fresh interpreter */
function stopExecution() {
  worker.terminate()

  display('Execution stopped. Interpreter state has been reset.', false, true)

  workerIsReady = false
  workerIsRunning = false
  worker = createWorker()
  updateRunButtonState()
}

/** Displays the given text in the designated output div */
function display(text: string, isError = false, isMuted = false) {
  const span = document.createElement('span')
  if (isError) {
    span.className = 'output-error'
  } else if (isMuted) {
    span.className = 'output-muted'
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

  saveSplit(currentLayout as 'horizontal' | 'vertical', panelSplit) // Save the current split percentage for the current layout before switching

  main.setAttribute('data-layout', newLayout)
  localStorage.setItem('layout', newLayout) // Save the selected layout to localStorage for persistence across sessions

  panelSplit = loadSplit(newLayout as 'horizontal' | 'vertical') // Load the saved split percentage for the new layout
  applySplit(panelSplit) // Apply the loaded split percentage to the main element
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

panelSplit = loadSplit(savedLayout as 'horizontal' | 'vertical')
applySplit(panelSplit) // Apply the saved split percentage for the selected layout

/** Applies the given theme palette to the document by setting CSS variables for each color in the palette and updating the body's data-theme attribute */
function applyThemePalette(theme: { palette: ThemePalette; dark: boolean }) {
  const root = document.documentElement
  Object.entries(theme.palette).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value)
  })
  document.body.dataset.theme = theme.dark ? 'dark' : 'light'
}

applyThemePalette(initialTheme)

/** Pending hash update timer */
let hashUpdateTimer: number | undefined

/** The initial editor contents, restored from a shared link fragment if present */
let initialCode = ''

// Restore code from the URL hash if this is a shared link
const codeHashMatch = location.hash.match(/#code=([^&]+)/)
if (codeHashMatch) {
  const decoded = decodeHashFragmentToCode(codeHashMatch[1])
  if (decoded === null) {
    console.warn('Malformed code hash in URL - ignoring')
    display('Warning: Malformed code hash in URL - ignoring', true, true)
    history.replaceState(null, '', location.pathname + location.search) // Remove the malformed hash from the URL
  } else {
    initialCode = decoded
  }
}

const hashUpdateExtension = EditorView.updateListener.of((update) => {
  if (!update.docChanged) { return }
  window.clearTimeout(hashUpdateTimer)
  hashUpdateTimer = window.setTimeout(writeCodeToHash, HASH_UPDATE_DEBOUNCE_MS, update.state.doc.toString())
})


/** Initializes the CodeMirror editor with the specified extensions and attaches it to the designated parent element */
const editor = new EditorView({
  doc: initialCode,
  extensions: [
    keymapExtension,
    basicSetup,
    python(),
    themeExtension,
    themeCompartment.of(initialTheme.extension),
    hashUpdateExtension
  ],
  parent: sourceCode
})

// Focus the editor as soon as it is ready for immediate typing
editor.focus()

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

// Start tracking a divider drag when the pointer goes down on it
divider.addEventListener('pointerdown', (event) => {
  isDraggingDivider = true
  dragStartPointer = main.getAttribute('data-layout') === 'horizontal' ? event.clientX : event.clientY
  dragStartSplit = panelSplit

  document.body.classList.add('dragging')
  divider.setPointerCapture(event.pointerId)
})


// Resize the panels live while the pointer moves during a drag
divider.addEventListener('pointermove', (event) => {
  if (!isDraggingDivider) { return }

  const horizontal = main.getAttribute('data-layout') === 'horizontal'
  const pointer = horizontal ? event.clientX : event.clientY
  const size = horizontal ? main.clientWidth : main.clientHeight
  const delta = pointer - dragStartPointer
  const newSplit = dragStartSplit + (delta / size) * 100

  panelSplit = Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, newSplit))
  applySplit(panelSplit)
})

// Finish the drag and remember the chosen split
function finishDrag() {
  if (!isDraggingDivider) { return }
  isDraggingDivider = false
  document.body.classList.remove('dragging')
  saveSplit(main.getAttribute('data-layout') as 'horizontal' | 'vertical', panelSplit)
}

divider.addEventListener('pointerup', finishDrag)
divider.addEventListener('pointercancel', finishDrag)

// Reset the panel split to its default when the divider is double-clicked
divider.addEventListener('dblclick', () => {
  applySplit(SPLIT_DEFAULT)
  saveSplit(main.getAttribute('data-layout') as 'horizontal' | 'vertical', SPLIT_DEFAULT)
})
