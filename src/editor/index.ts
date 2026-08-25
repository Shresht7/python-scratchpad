import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"

import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"

import { Compartment, type Extension } from "@codemirror/state"

import { writeCodeToHash, HASH_UPDATE_DEBOUNCE_MS } from "../modules/share"
import { runCode } from "../service/runner"

/** The div where the source code will be entered */
const sourceCode = document.getElementById("source-code") as HTMLDivElement

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

/** A layout extension to ensure the editor takes up the full height of its container and allows scrolling */
const layoutExtension = EditorView.theme({
  "&": { height: "100%", position: 'relative' },
  ".cm-scroller": { overflow: "auto", position: 'absolute', inset: 0 },
  ".cm-lineNumbers": { minWidth: "3ch" },
})

/** Pending hash update timer */
let hashUpdateTimer: number | undefined

/** Keeps the editor contents in sync with the URL hash for sharing */
const hashSyncExtension = EditorView.updateListener.of((update) => {
  if (!update.docChanged) { return }
  window.clearTimeout(hashUpdateTimer)
  hashUpdateTimer = window.setTimeout(writeCodeToHash, HASH_UPDATE_DEBOUNCE_MS, update.state.doc.toString())
})

/** Private compartment that controls the editor's syntax highlighting theme */
const themeCompartment = new Compartment()

/** The editor instance, set once by createEditor */
let editor!: EditorView

/** Creates the CodeMirror editor with all standard extensions */
export function createEditor(initialDoc: string, initialTheme: Extension): EditorView {
  editor = new EditorView({
    doc: initialDoc,
    extensions: [
      keymapExtension,
      basicSetup,
      python(),
      layoutExtension,
      themeCompartment.of(initialTheme),
      hashSyncExtension
    ],
    parent: sourceCode,
  })
  return editor
}

/** Returns the current contents of the editor */
export function getEditorContents(): string {
  return editor.state.doc.toString()
}

/** Reconfigures the editor's syntax theme without touching the rest of the layout */
export function setEditorTheme(theme: Extension): void {
  editor.dispatch({ effects: themeCompartment.reconfigure(theme) })
}
