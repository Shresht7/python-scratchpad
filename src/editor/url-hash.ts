import { EditorView } from "codemirror"
import { writeCodeToHash, HASH_UPDATE_DEBOUNCE_MS } from "../modules/share"

/** Pending hash update timer */
let hashUpdateTimer: number | undefined

/** Keeps the editor contents in sync with the URL hash for sharing */
export const hashSyncExtension = EditorView.updateListener.of((update) => {
    if (!update.docChanged) { return }
    window.clearTimeout(hashUpdateTimer)
    hashUpdateTimer = window.setTimeout(writeCodeToHash, HASH_UPDATE_DEBOUNCE_MS, update.state.doc.toString())
})
