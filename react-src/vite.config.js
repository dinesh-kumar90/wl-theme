import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Lives at repo-root/react-src/. Builds into repo-root/assets/.
//
// Key differences from the single-bundle (iife) version:
//   - format: "es"  → required for dynamic import() code-splitting to work
//   - no build.lib  → lib mode always produces one file; we want Rollup
//                      free to split off a separate chunk per component
//   - type="module" is required on the <script> tag that loads this in
//     theme.liquid, since dynamic import() only works in a module context
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "../assets",
    emptyOutDir: false,
    cssCodeSplit: false,
    minify: "esbuild",
    rollupOptions: {
      input: "src/main.jsx",
      output: {
        format: "es",
        // Keep React/ReactDOM (and any other shared node_modules code)
        // in their own chunk, cached once across every page, instead of
        // duplicated into each component chunk.
        manualChunks(id) {
          if (id.includes("node_modules")) return "theme-react-vendor";
        },
        entryFileNames: "theme-react.js",
        chunkFileNames: "theme-react-[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name && assetInfo.name.endsWith(".css")
            ? "collection-showcase.css"
            : "theme-react-[name][extname]",
      },
    },
  },
});
