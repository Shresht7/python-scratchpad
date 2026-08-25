import "./style.css"

import { decodeHashFragmentToCode } from "./modules/share"

import * as output from './ui/output'
import { initializeRunner } from './service/runner'
import { initializeThemePicker } from './ui/theme-picker'
import { createEditor, setEditorTheme } from './editor'

import './ui/icons'
import './ui/layout'

/** The button to clear the output display */
const clearButton = document.getElementById("clear-output") as HTMLButtonElement

// Register event listener for the clear button to empty the output display
clearButton.addEventListener("click", output.clear)

/** The buttons to copy the source code and the output to the clipboard */
const copyCodeButton = document.getElementById("copy-code") as HTMLButtonElement
const copyOutputButton = document.getElementById("copy-output") as HTMLButtonElement

/** How long the copied checkmark feedback stays visible on a copy button */
const COPY_FEEDBACK_MS = 1000

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
copyOutputButton.addEventListener("click", () => copyText(output.getText(), copyOutputButton))

initializeRunner(() => editor.state.doc.toString())

/** The initial editor contents, restored from a shared link fragment if present */
let initialCode = ''

// Restore code from the URL hash if this is a shared link
const codeHashMatch = location.hash.match(/#code=([^&]+)/)
if (codeHashMatch) {
  const decoded = decodeHashFragmentToCode(codeHashMatch[1])
  if (decoded === null) {
    console.warn('Malformed code hash in URL - ignoring')
    output.display('Warning: Malformed code hash in URL - ignoring', { isError: true, isMuted: true })
    history.replaceState(null, '', location.pathname + location.search) // Remove the malformed hash from the URL
  } else {
    initialCode = decoded
  }
}

const initialTheme = initializeThemePicker((theme) => {
  setEditorTheme(theme.extension)
})

const editor = createEditor(initialCode, initialTheme.extension)

// Focus the editor as soon as it is ready for immediate typing
editor.focus()
