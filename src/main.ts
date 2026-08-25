import { Editor } from './editor'
import { initializeRunner } from './service/runner'

import { initializeThemePicker } from './ui/theme-picker'
import { restoreCodeFromHash } from "./modules/share"

import './ui/icons'
import './ui/layout'
import './modules/clear'
import './modules/copy'

import "./style.css"

// Load the initial source code from the URL hash if present, otherwise use an empty string
const initialCode = restoreCodeFromHash()

// Initialize the theme picker and register a on change callback to update the editor's theme
const initialTheme = initializeThemePicker((theme) => {
  editor.setTheme(theme.extension)
})

// Create the editor instance and attach it to the DOM
const editor = new Editor("source-code", initialCode, initialTheme.extension)

// Focus the editor as soon as it is ready for immediate typing
editor.focus()

// Initialize the code runner
initializeRunner(() => editor.getContents())
