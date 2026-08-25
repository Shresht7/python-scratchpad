import * as output from '../ui/output'
import { getModifierKey } from '../modules/helpers'
import type { WorkerToMain } from './worker'

// CREATE WORKER
// -------------

/** Maximum time (ms) a single execution is allowed to run before being auto-terminated */
const RUN_TIMEOUT_MS = 10_000

/** Maximum code size (bytes) to send to the worker to prevent memory exhaustion */
const MAX_CODE_SIZE = 500_000

/** Creates a MicroPython worker and wires up its message handling */
function createWorker(): Worker {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

    worker.addEventListener('message', (event: MessageEvent<WorkerToMain>) => {
        const message = event.data
        switch (message.type) {
            case 'ready':
                workerIsReady = true
                updateRunButtonState()
                break
            case 'stdout':
                output.display(message.text)
                break
            case 'stderr':
                output.display(message.text, { isError: true })
                break
            case 'done':
                if (message.id === runId) {
                    clearRunTimeout()
                    workerIsRunning = false
                    updateRunButtonState()
                }
                break
            case 'error':
                if (message.id === runId) {
                    clearRunTimeout()
                    workerIsRunning = false
                    updateRunButtonState()
                    output.display(`Error: ${message.message}`, { isError: true })
                }
                break
        }
    })

    // If the worker itself fails to load, surface it instead of failing silently
    worker.addEventListener('error', (event) => {
        output.display(`Interpreter failed to load. Try reloading the page. Error: ${event.message}`, { isError: true })
        console.error(event)
    })

    return worker
}

// ------------
// WORKER STATE
// ------------

/** The worker that runs the MicroPython interpreter in a separate thread */
let worker = createWorker()

/** Whether the interpreter has finished loading and can accept code */
let workerIsReady = false

/** Whether Python code is currently executing */
let workerIsRunning = false

/** Monotonic id assigned to each run request */
let runId = 0

/** Handle for the execution timeout timer */
let timeoutTimer: number | undefined

/** Clears the execution timeout timer if one is active */
function clearRunTimeout() {
    if (timeoutTimer !== undefined) {
        window.clearTimeout(timeoutTimer)
        timeoutTimer = undefined
    }
}

/** Source-code provider, injected so that runner never needs to know about the editor */
let getSource: () => string = () => ''

// ---
// RUN
// ---

/** The button to run the Python code */
const runButton = document.getElementById("run-button") as HTMLButtonElement

/** The label inside the run/stop button */
const runLabel = document.getElementById("run-label") as HTMLSpanElement

// Set the tooltip with platform-specific modifier key
runButton.title = `Run (${getModifierKey()}+Enter)`

// Register event listener for the run button to execute the Python code and display the output
runButton.addEventListener("click", () => {
    if (workerIsRunning) {
        stopExecution()
    } else {
        runCode()
    }
})

/** Updates the state of the run button based on whether the code is executing */
function updateRunButtonState() {
    runButton.disabled = !workerIsReady
    if (workerIsRunning) {
        runButton.classList.add('running')
        runButton.title = 'Stop Execution'
        runLabel.textContent = 'Stop'
    } else {
        runButton.classList.remove('running')
        runButton.title = `Run (${getModifierKey()}+Enter)`
        runLabel.textContent = 'Run'
    }
}

/** Executes the Python code entered by the user in the textarea and displays the output in the designated div */
export function runCode() {
    if (!workerIsReady || workerIsRunning) { return }

    // Get the Python code from the textarea
    const src = getSource()
    if (!src) { return }

    // Reject code that exceeds the size limit
    if (src.length > MAX_CODE_SIZE) {
        output.display(`Code exceeds ${MAX_CODE_SIZE / 1000}KB limit`, { isError: true })
        return
    }

    output.clear() // Clear previous output before running new code

    // Mark that the worker is now running code and update the run button state
    workerIsRunning = true
    updateRunButtonState()

    // Send a message to the worker to run the Python code
    worker.postMessage({ type: 'run', id: ++runId, src })

    // Auto-terminate if execution exceeds the time limit
    timeoutTimer = window.setTimeout(() => {
        output.display(`Execution timed out after ${RUN_TIMEOUT_MS / 1000}s`, { isMuted: true })
        stopExecution()
    }, RUN_TIMEOUT_MS)
}

/** Terminates the worker to interrupt any running code and starts a fresh interpreter */
export function stopExecution() {
    clearRunTimeout()
    worker.terminate()

    output.display('Execution stopped. Interpreter state has been reset.', { isMuted: true })

    workerIsReady = false
    workerIsRunning = false
    worker = createWorker()
    updateRunButtonState()
}

/** Wires the runner to the rest of the app */
export function initializeRunner(sourceProvider: () => string) {
    getSource = sourceProvider
    updateRunButtonState() // Ensure the run button is in the correct state after initialization
}
