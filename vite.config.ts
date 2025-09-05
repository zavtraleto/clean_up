import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  build: {
    target: "es2020",
    outDir: "docs",
  },
  base: "/clean_up/",
});
