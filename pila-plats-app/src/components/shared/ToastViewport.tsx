// Region viva de notificacions temporals generades des del context de menu.
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useMenu } from "../../hooks/useMenu";
import { Button } from "../ui/Button";
import { cn } from "../ui/utils";

export function ToastViewport() {
  const { toasts, dismissToast } = useMenu();

  return (
    <div className="fixed inset-x-0 bottom-[76px] z-50 mx-auto flex w-full max-w-[440px] flex-col gap-2 px-4 md:bottom-6" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toast.tone === "warning" || toast.tone === "danger" ? AlertTriangle : CheckCircle2;
        return (
          <div
            key={toast.id}
            className={cn(
              "page-enter flex items-center gap-2 rounded-[10px] border bg-card p-3 shadow-[var(--shadow-card-hover)]",
              toast.tone === "warning" && "border-accent",
              toast.tone === "danger" && "border-destructive",
              toast.tone === "success" && "border-primary",
            )}
            role="status"
          >
            <Icon aria-hidden="true" className={cn("h-5 w-5 shrink-0", toast.tone === "danger" ? "text-destructive" : toast.tone === "warning" ? "text-warning" : "text-primary")} />
            <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{toast.text}</p>
            <Button variant="ghost" size="icon" aria-label="Tancar notificació" onClick={() => dismissToast(toast.id)} className="h-10 w-10 min-h-10 min-w-10">
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
