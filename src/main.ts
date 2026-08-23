// Library
import { loadMicroPython } from '@micropython/micropython-webassembly-pyscript'
import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"
import { keymap } from "@codemirror/view"

// Initialize MicroPython and setup where to display stdout and stderr
const micropython = await loadMicroPython({
  stdout: (text: string) => display(text),
  stderr: (text: string) => display(text),
})

/** The div where the output of the Python code will be displayed */
const displayOutput = document.getElementById("display-output") as HTMLDivElement
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

/** Sets up a keymap extension for the CodeMirror editor to run the code when "Mod-Enter" is pressed */
const keymapExtension = keymap.of([
  {
    key: "Mod-Enter",
    run: () => {
      runCode()
      return true
    }
  }
])

/** Initializes the CodeMirror editor with the specified extensions and attaches it to the designated parent element */
const editor = new EditorView({
  doc: '',
  extensions: [
    keymapExtension,
    basicSetup,
    python(),
  ],
  parent: document.getElementById('source-code')!
})
