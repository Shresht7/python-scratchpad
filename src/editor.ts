import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"


export const editor = new EditorView({
    doc: '',
    extensions: [
        basicSetup,
        python(),
    ],
    parent: document.getElementById('source-code')!
})
