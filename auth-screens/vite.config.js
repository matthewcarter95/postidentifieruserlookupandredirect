import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        entryFileNames: "bundle.js", // Single JavaScript output file
        assetFileNames: "[name].[ext]", // Single CSS output file
        manualChunks: () => "bundle.js", // Force single chunk
      },
    },
    cssCodeSplit: false, // Disable CSS code-splitting to bundle CSS in one file
    sourcemap: true, // Include a source map to make debugging easier
    emptyOutDir: true, // clean out the build directory before every build
  },
});
