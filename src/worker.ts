import wasmUrl from '@micropython/micropython-webassembly-pyscript/micropython.wasm?url'
import { loadMicroPython } from '@micropython/micropython-webassembly-pyscript'

/** Messages the worker sends to the main thread */
export type WorkerToMain =
    | { type: 'ready' }
    | { type: 'stdout', text: string }
    | { type: 'stderr', text: string }
    | { type: 'done', id: number }
    | { type: 'error', id: number, message: string }

/** Messages the main thread sends to the worker */
export interface RunMessage {
    type: 'run'
    id: number
    src: string
}

// tsconfig lib has no WebWorker types, so `self` would be typed as Window
type WorkerContext = {
    postMessage(message: WorkerToMain): void
    addEventListener(type: 'message', listener: (event: MessageEvent<RunMessage>) => void): void
}
const ctx = self as unknown as WorkerContext

// Initialize MicroPython
const micropython = await loadMicroPython({
    url: wasmUrl,
    stdout: (text: string) => ctx.postMessage({ type: 'stdout', text }),
    stderr: (text: string) => ctx.postMessage({ type: 'stderr', text }),
})

// Post a message to the main thread indicating that the worker is ready
ctx.postMessage({ type: 'ready' })

// Listen for messages from the main thread to run Python code
ctx.addEventListener('message', async (event) => {
    const message = event.data
    if (message.type === 'run') {
        try {
            await micropython.runPythonAsync(message.src)
            ctx.postMessage({ type: 'done', id: message.id })
        } catch (error) {
            ctx.postMessage({ type: 'error', id: message.id, message: (error as Error).message })
        }
    }
})
