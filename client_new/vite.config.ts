import { defineConfig } from "vite";

export default defineConfig({
    root: ".",
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
    server: {
        open: true,
    },
    css: {
        postcss: {
            plugins: [
                require('@tailwindcss/postcss'),
                require("autoprefixer"),
            ],
        },
    },
});