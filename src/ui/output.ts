/** The div where the output of the Python code will be displayed */
const displayOutput = document.getElementById('display-output') as HTMLDivElement

type DisplayOptions = {
    isError?: boolean
    isMuted?: boolean
}

/** Display the given text in the designated output div */
export function display(text: string, { isError = false, isMuted = false }: DisplayOptions = {}) {
    const span = document.createElement('span')
    if (isError) {
        span.className = 'error'
    } else if (isMuted) {
        span.className = 'muted'
    }
    span.textContent = text + '\n'
    displayOutput.appendChild(span)
}

/** Clears the output div to remove any previous output */
export function clear(): void {
    displayOutput.innerHTML = ''
}

/** Returns the text currently shown in the output pane */
export function getText(): string {
    return displayOutput.innerText
}
