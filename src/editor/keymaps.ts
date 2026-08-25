import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"

import { runCode } from "../service/runner"

/** Sets up a keymap extension for the CodeMirror editor, including running the code with "Mod-Enter"/"Shift-Enter" and indenting with Tab */
export const keymapExtension = keymap.of([
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
