/** The main element that contains the source code input and output display */
const main = document.getElementsByTagName('main')[0]

/** The draggable divider between the code and the output panels */
const divider = document.getElementById("divider") as HTMLDivElement

/** The button to toggle the layout of the main element between horizontal and vertical */
const toggleLayoutButton = document.getElementById('toggle-layout') as HTMLButtonElement

/** Bounds and default for the panel split percentage */
const SPLIT_MIN = 15
const SPLIT_MAX = 85
const SPLIT_DEFAULT = 66.67

/** The current split percentage between the code and output panels */
let panelSplit = SPLIT_DEFAULT

/** Whether a divider drag is in progress */
let isDraggingDivider = false

/** Pointer position and split percentage when the current drag started */
let dragStartPointer = 0
let dragStartSplit = 0

/** Reads the saved split percentage for a layout, falling back to the default */
function loadSplit(layout: 'horizontal' | 'vertical'): number {
    const split = Number(localStorage.getItem(`split-${layout}`))
    return Number.isFinite(split) && split > 0 ? Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, split)) : SPLIT_DEFAULT
}

/** Persist the given split percentage for a layout */
function saveSplit(layout: 'horizontal' | 'vertical', split: number) {
    localStorage.setItem(`split-${layout}`, String(split))
}

/** Applies the split percentage to the main element's --split variable */
function applySplit(percentage: number) {
    main.style.setProperty('--panel-split', `${percentage}%`)
    panelSplit = percentage
}

/** Toggles the layout of the main element between horizontal and vertical by changing its data-layout attribute and dispatching a layout-change event */
function toggleLayout() {
    const currentLayout = main.getAttribute('data-layout')
    const newLayout = currentLayout === 'horizontal' ? 'vertical' : 'horizontal'

    saveSplit(currentLayout as 'horizontal' | 'vertical', panelSplit) // Save the current split percentage for the current layout before switching

    main.setAttribute('data-layout', newLayout)
    localStorage.setItem('layout', newLayout) // Save the selected layout to localStorage for persistence across sessions

    panelSplit = loadSplit(newLayout as 'horizontal' | 'vertical') // Load the saved split percentage for the new layout
    applySplit(panelSplit) // Apply the loaded split percentage to the main element
}

// Register event listener for the toggle layout button to switch between horizontal and vertical layouts
toggleLayoutButton.addEventListener('click', toggleLayout)

const savedLayout = localStorage.getItem('layout') || 'horizontal'
main.setAttribute('data-layout', savedLayout)

panelSplit = loadSplit(savedLayout as 'horizontal' | 'vertical')
applySplit(panelSplit) // Apply the saved split percentage for the selected layout

// Start tracking a divider drag when the pointer goes down on it
divider.addEventListener('pointerdown', (event) => {
    isDraggingDivider = true
    dragStartPointer = main.getAttribute('data-layout') === 'horizontal' ? event.clientX : event.clientY
    dragStartSplit = panelSplit

    document.body.classList.add('dragging')
    divider.setPointerCapture(event.pointerId)
})


// Resize the panels live while the pointer moves during a drag
divider.addEventListener('pointermove', (event) => {
    if (!isDraggingDivider) { return }

    const horizontal = main.getAttribute('data-layout') === 'horizontal'
    const pointer = horizontal ? event.clientX : event.clientY
    const size = horizontal ? main.clientWidth : main.clientHeight
    const delta = pointer - dragStartPointer
    const newSplit = dragStartSplit + (delta / size) * 100

    panelSplit = Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, newSplit))
    applySplit(panelSplit)
})

// Finish the drag and remember the chosen split
function finishDrag() {
    if (!isDraggingDivider) { return }
    isDraggingDivider = false
    document.body.classList.remove('dragging')
    saveSplit(main.getAttribute('data-layout') as 'horizontal' | 'vertical', panelSplit)
}

divider.addEventListener('pointerup', finishDrag)
divider.addEventListener('pointercancel', finishDrag)

// Reset the panel split to its default when the divider is double-clicked
divider.addEventListener('dblclick', () => {
    applySplit(SPLIT_DEFAULT)
    saveSplit(main.getAttribute('data-layout') as 'horizontal' | 'vertical', SPLIT_DEFAULT)
})
