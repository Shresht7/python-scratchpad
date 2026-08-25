// vite.config.ts
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "./",
    optimizeDeps: {
        exclude: ["@micropython/micropython-webassembly-pyscript"],
    },
    worker: {
        format: "es",
    },
    plugins: [VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg"],
        manifest: {
            name: "Python Scratchpad",
            short_name: "Python Scratchpad",
            description: "A simple Python scratchpad in the browser powered by MicroPython WebAssembly",
            theme_color: "#3776ab",
            background_color: "#1e1e2e",
            display: 'standalone',
            start_url: '.',
            icons: [
                { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
                { src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
            ]
        }
    })],
});
