// Transicions curtes reutilitzades per canvis de pagina i modals contextuals.
import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { cn } from "../ui/utils";

type PageTransitionProps = ComponentProps<typeof motion.main>;

export function PageTransition({ className, ...props }: PageTransitionProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("app-page", className)}
      {...props}
    />
  );
}

// Els modals comparteixen el mateix ritme visual que les pantalles sense duplicar props d'animacio.
export const modalMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;
