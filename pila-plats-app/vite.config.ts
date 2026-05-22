// Configuracio de bundling: React i Tailwind comparteixen el base path de desplegament.
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // GitHub Pages necessita el subdirectori del repositori; desenvolupament serveix des de l'arrel.
  base: mode === "production" ? "/pila-plats-app/" : "/",
  plugins: [react(), tailwindcss()],
}));
