import { Editor } from './editor'
import { initializeRunner } from './service/runner'

import './ui/icons'
import './ui/layout'
import { getText } from './ui/output'
import { showToast } from './ui/toast'
import { copyText } from './modules/copy'
import './modules/clear'
import { initializeThemePicker } from './ui/theme-picker'
import { restoreCodeFromHash } from "./modules/share"

import "./style.css"

// Load the initial source code from the URL hash if present, otherwise use an empty string
const { code: initialCode, warning: hashWarning } = restoreCodeFromHash()

// Initialize the theme picker and register a on change callback to update the editor's theme
const initialTheme = initializeThemePicker((theme) => {
  editor.setTheme(theme.extension)
})

// Create the editor instance and attach it to the DOM
const editor = new Editor("source-code", initialCode, initialTheme.extension)

// Focus the editor as soon as it is ready for immediate typing
editor.focus()

// Wire up copy buttons
const copyCodeButton = document.getElementById("copy-code") as HTMLButtonElement
const copyOutputButton = document.getElementById("copy-output") as HTMLButtonElement
copyCodeButton.addEventListener("click", () => copyText(editor.getContents(), copyCodeButton, { toast: 'Code copied to clipboard' }))
copyOutputButton.addEventListener("click", () => copyText(getText(), copyOutputButton, { toast: 'Output copied to clipboard' }))

// Initialize the code runner
initializeRunner(() => editor.getContents())

// Show any hash restore warning after the runner is ready
if (hashWarning) {
  showToast(hashWarning)
}
