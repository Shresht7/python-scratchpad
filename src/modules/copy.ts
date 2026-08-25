/** How long the copied checkmark feedback stays visible on a copy button */
const COPY_FEEDBACK_MS = 1000

/** Copies the given text to the clipboard and briefly swaps the button's icon to a checkmark */
export async function copyText(text: string, button: HTMLButtonElement) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error(error)
    return
  }

  button.classList.add('copied')

  // Restart the feedback timer if the button is clicked again while feedback is showing
  const previousTimer = Number(button.dataset.timer ?? 0)
  if (previousTimer) { window.clearTimeout(previousTimer) }

  button.dataset.timer = String(window.setTimeout(() => {
    button.classList.remove('copied')
    delete button.dataset.timer
  }, COPY_FEEDBACK_MS))
}
