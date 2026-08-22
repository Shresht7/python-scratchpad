import { loadMicroPython } from '@micropython/micropython-webassembly-pyscript'

const micropython = await loadMicroPython({
  stdout: (text: string) => console.log("[micropython stdout]", text)
})

micropython.runPython(`print("Hello from MicroPython!")`)
