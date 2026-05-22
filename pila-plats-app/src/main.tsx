// Punt d'entrada del client: prepara diagnostics de desenvolupament i munta React.
import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

const DEBUG = import.meta.env.DEV;

// Els errors globals ajuden a detectar problemes fora de l'arbre de components durant les proves locals.
if (DEBUG) {
  console.info("[Pila-Plats debug] Arrencant React", {
    baseUrl: import.meta.env.BASE_URL,
    mode: import.meta.env.MODE,
    googleClientIdPresent: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID),
    currentPath: window.location.pathname,
  });

  window.addEventListener("error", (event) => {
    console.error("[Pila-Plats debug] Error global del navegador", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Pila-Plats debug] Promesa rebutjada sense capturar", event.reason);
  });
}

// La frontera evita que un error de render deixi la pantalla completament en blanc.
class DebugErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Pila-Plats debug] Error capturat per React", {
      error,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-background px-4 text-center text-foreground">
          <div className="max-w-sm rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h1 className="text-xl font-extrabold">Alguna cosa no ha anat bé</h1>
            <p className="mt-2 text-sm text-muted-foreground">Revisa la consola del navegador per veure el detall de l'error.</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("[Pila-Plats debug] No s'ha trobat l'element #root a index.html");
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <DebugErrorBoundary>
        <App />
      </DebugErrorBoundary>
    </StrictMode>,
  );
}
