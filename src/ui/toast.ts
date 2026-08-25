/** How long a toast stays visible before fading out (milliseconds) */
const TOAST_DURATION_MS = 3000

/** Creates the toast container if it doesn't already exist */
function getContainer(): HTMLDivElement {
    let container = document.getElementById('toast-container') as HTMLDivElement | null
    if (!container) {
        container = document.createElement('div')
        container.id = 'toast-container'
        container.setAttribute('role', 'status')
        container.setAttribute('aria-live', 'polite')
        document.body.appendChild(container)
    }
    return container
}

/** Displays a brief toast notification at the bottom of the screen */
export function showToast(message: string, { duration = TOAST_DURATION_MS } = {}) {
    const container = getContainer()

    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.textContent = message
    container.appendChild(toast)

    // Schedule fade-out and removal
    const timer = window.setTimeout(() => {
        toast.classList.add('toast-exit')
        toast.addEventListener('animationend', () => toast.remove())
    }, duration)

    // Allow clicking to dismiss early
    toast.addEventListener('click', () => {
        window.clearTimeout(timer)
        toast.classList.add('toast-exit')
        toast.addEventListener('animationend', () => toast.remove())
    })
}
