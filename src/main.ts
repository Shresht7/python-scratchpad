import { createEditor, getEditorContents, setEditorTheme } from './editor'
import { initializeRunner } from './service/runner'
import * as output from './ui/output'

import { initializeThemePicker } from './ui/theme-picker'
import { decodeHashFragmentToCode } from "./modules/share"

import './ui/icons'
import './ui/layout'
import './modules/clear'
import './modules/copy'

import "./style.css"

initializeRunner(getEditorContents)

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
