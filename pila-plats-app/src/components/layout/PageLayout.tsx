// Capcalera i contenidor comuns per mantenir jerarquia, accions i transicio entre pantalles.
import type { ReactNode } from "react";
import { HelpCircle, UserRound } from "lucide-react";
import { Link } from "react-router";
import { PageTransition } from "./PageTransition";
import { Button } from "../ui/Button";

interface PageLayoutProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function PageLayout({ title, eyebrow, children, action }: PageLayoutProps) {
  return (
    <PageTransition>
      <header className="mb-5 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-sm font-semibold text-muted-foreground">{eyebrow}</p>}
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-foreground">{title}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
          <Button variant="ghost" size="icon" aria-label="Ajuda sobre aquesta pantalla" title="Ajuda">
            <HelpCircle aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Link
            to="/profile"
            aria-label="Anar al perfil i preferències"
            className="tap-target inline-flex items-center justify-center rounded-[8px] border border-border bg-card text-foreground shadow-sm hover:bg-muted"
          >
            <UserRound aria-hidden="true" className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <div className="flex w-full flex-1 flex-col">
        {children}
      </div>
    </PageTransition>
  );
}
