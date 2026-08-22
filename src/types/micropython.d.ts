// src/types/micropython.d.ts
declare module "@micropython/micropython-webassembly-pyscript" {

    export function loadMicroPython(
        options?: LoadMicroPythonOptions,
    ): Promise<MicroPythonInstance>

    export interface LoadMicroPythonOptions {
        stdout?: (text: string) => void;
        stderr?: (text: string) => void;
    }

}
