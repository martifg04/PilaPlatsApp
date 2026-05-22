// Boto base que centralitza variants, mida tactil i estat de carrega.
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  isLoading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "tap-target inline-flex items-center justify-center gap-2 rounded-[8px] border font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" && "border-primary bg-primary px-4 text-primary-foreground shadow-[0_8px_18px_rgba(47,125,79,0.22)] hover:bg-[#256b43]",
        variant === "secondary" && "border-border bg-card px-4 text-foreground shadow-sm hover:border-primary/50 hover:bg-muted",
        variant === "ghost" && "border-transparent bg-transparent px-3 text-foreground hover:bg-muted",
        variant === "danger" && "border-destructive bg-destructive px-4 text-destructive-foreground hover:bg-[#a91c34]",
        size === "sm" && "min-h-10 px-3 text-sm",
        size === "md" && "text-sm",
        size === "icon" && "h-11 w-11 p-0",
        className,
      )}
      {...props}
    >
      {isLoading && <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
