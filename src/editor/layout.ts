import { EditorView } from "codemirror"

/** A layout extension to ensure the editor takes up the full height of its container and allows scrolling */
export const layoutExtension = EditorView.theme({
    "&": { height: "100%", position: 'relative' },
    ".cm-scroller": { overflow: "auto", position: 'absolute', inset: 0 },
    ".cm-lineNumbers": { minWidth: "3ch" },
})

