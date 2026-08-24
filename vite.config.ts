// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
    optimizeDeps: {
        exclude: ["@micropython/micropython-webassembly-pyscript"],
    },
    worker: {
        format: "es",
    },
});
