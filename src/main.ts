import { loadMicroPython } from '@micropython/micropython-webassembly-pyscript'

import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"

import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"

import "./style.css"

// Initialize MicroPython and setup where to display stdout and stderr
const micropython = await loadMicroPython({
  stdout: (text: string) => display(text),
  stderr: (text: string) => display(text),
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
    display(`Error: ${error}`)
  }
}

/** Displays the given text in the designated output div */
function display(text: string) {
  displayOutput.innerText += text
}

/** Clears the output div to remove any previous output */
function clearOutput() {
  displayOutput.innerText = ""
}

/** Sets up a keymap extension for the CodeMirror editor, including running the code with "Mod-Enter" and indenting with Tab */
const keymapExtension = keymap.of([
  indentWithTab,
  {
    key: "Mod-Enter",
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
}

// Register event listener for the toggle layout button to switch between horizontal and vertical layouts
toggleLayoutButton.addEventListener('click', toggleLayout)

/** Sets up a theme extension for the CodeMirror editor to ensure it takes up the full height of its container and allows scrolling */
const themeExtension = EditorView.theme({
  "&": { height: "100%", position: 'relative' },
  ".cm-scroller": { overflow: "auto", position: 'absolute', inset: 0 },
})


/** Initializes the CodeMirror editor with the specified extensions and attaches it to the designated parent element */
const editor = new EditorView({
  doc: '',
  extensions: [
    keymapExtension,
    basicSetup,
    python(),
    themeExtension,
  ],
  parent: sourceCode
})
