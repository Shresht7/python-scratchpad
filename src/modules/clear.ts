import * as output from '../ui/output'

/** The button to clear the output display */
const clearButton = document.getElementById("clear-output") as HTMLButtonElement

// Register event listener for the clear button to empty the output display
clearButton.addEventListener("click", output.clear)
