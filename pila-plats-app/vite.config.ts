// Configuracio de bundling: React i Tailwind comparteixen el base path de desplegament.
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  return {
    // Actions passa el subdirectori del repositori; el valor per defecte cobreix el remot actual.
    base: mode === "production" ? env.VITE_BASE_PATH || "/PilaPlatsApp/" : "/",
    plugins: [react(), tailwindcss()],
  };
});
