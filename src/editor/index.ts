// Base
import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"

// Extensions
import { Compartment, type Extension } from "@codemirror/state"
import { keymapExtension } from "./keymaps"
import { layoutExtension } from "./layout"
import { hashSyncExtension } from "./url-hash"

export class Editor {

  /** The CodeMirror editor view instance */
  private view: EditorView

  /** The private compartment that controls the editor's syntax highlighting theme */
  private themeCompartment: Compartment = new Compartment()

  constructor(element: string | HTMLElement, doc: string, theme: Extension, extensions: Extension[] = []) {

    const sourceCode = typeof element === "string" ? document.getElementById(element) as HTMLDivElement : element

    this.view = new EditorView({
      doc,
      extensions: [
        keymapExtension,
        basicSetup,
        python(),
        layoutExtension,
        this.themeCompartment.of(theme),
        hashSyncExtension,
        ...extensions
      ],
      parent: sourceCode
    })

  }

  /** Focuses the editor */
  public focus(): void {
    this.view.focus()
  }

  /** Returns the current contents of the editor */
  public getContents(): string {
    return this.view.state.doc.toString()
  }

  /** Returns the current contents of the editor */
  get contents(): string {
    return this.getContents()
  }

  /** Reconfigures the editor's syntax theme without touching the rest of the layout */
  public setTheme(theme: Extension): void {
    this.view.dispatch({ effects: this.themeCompartment.reconfigure(theme) })
  }

}
