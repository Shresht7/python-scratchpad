import { createEditor, getEditorContents, setEditorTheme } from './editor'
import { initializeRunner } from './service/runner'

import { initializeThemePicker } from './ui/theme-picker'
import { restoreCodeFromHash } from "./modules/share"

import './ui/icons'
import './ui/layout'
import './modules/clear'
import './modules/copy'

import "./style.css"

initializeRunner(getEditorContents)

const initialCode = restoreCodeFromHash()

const initialTheme = initializeThemePicker((theme) => {
  setEditorTheme(theme.extension)
})

const editor = createEditor(initialCode, initialTheme.extension)

// Focus the editor as soon as it is ready for immediate typing
editor.focus()
