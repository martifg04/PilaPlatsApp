// Temporitzador de cuina reutilitzable amb durades rapides, progrés i feedback final.
import confetti from "canvas-confetti";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMenu } from "../../hooks/useMenu";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { cn } from "../ui/utils";

interface CookingTimerProps {
  minutes: number;
  compact?: boolean;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function buildDurations(minutes: number) {
  // Les alternatives eviten valors duplicats quan la recepta te una durada molt curta.
  return Array.from(new Set([Math.max(1, Math.round(minutes / 2)), minutes, minutes + 5]))
    .filter((value) => value > 0)
    .slice(0, 3);
}

export function CookingTimer({ minutes, compact = false }: CookingTimerProps) {
  const { showToast } = useMenu();
  const durations = useMemo(() => buildDurations(minutes), [minutes]);
  const [durationSeconds, setDurationSeconds] = useState(minutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) {
      return undefined;
    }

    // L'interval nomes existeix mentre el comptador esta corrent.
    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds > 0 || !isRunning || notifiedRef.current) {
      return;
    }

    // El ref impedeix repetir celebracio i toast quan React torna a executar efectes.
    notifiedRef.current = true;
    setIsRunning(false);
    setCompleted(true);
    showToast("Temporitzador acabat. El plat ja pot sortir!", "success");
    confetti({ particleCount: 45, spread: 55, origin: { y: 0.72 } });
  }, [isRunning, remainingSeconds, showToast]);

  const selectDuration = (duration: number) => {
    const nextSeconds = duration * 60;
    setDurationSeconds(nextSeconds);
    setRemainingSeconds(nextSeconds);
    setIsRunning(false);
    setCompleted(false);
    notifiedRef.current = false;
  };

  const reset = () => {
    setRemainingSeconds(durationSeconds);
    setIsRunning(false);
    setCompleted(false);
    notifiedRef.current = false;
  };

  const progressValue = durationSeconds - remainingSeconds;

  return (
    <Card className={cn("overflow-hidden", completed && "border-primary bg-primary/5", compact && "p-3")}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Cuina ara</p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-extrabold">
            <Timer aria-hidden="true" className="h-5 w-5 text-primary" />
            Temporitzador
          </h2>
        </div>
        <Badge tone={completed ? "green" : isRunning ? "orange" : "neutral"}>
          {completed ? "Acabat" : isRunning ? "En marxa" : "Preparat"}
        </Badge>
      </div>

      <motion.div
        animate={{ scale: isRunning ? [1, 1.015, 1] : 1 }}
        transition={{ duration: 1.5, repeat: isRunning ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" }}
        className="rounded-[10px] border border-border bg-muted p-4 text-center"
      >
        <p className="font-mono text-4xl font-extrabold tabular-nums text-foreground md:text-5xl">{formatClock(remainingSeconds)}</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {Math.round(durationSeconds / 60)} minuts seleccionats
        </p>
      </motion.div>

      <ProgressBar
        className="mt-4"
        value={progressValue}
        max={durationSeconds}
        tone="primary"
        label={`Temporitzador: ${formatClock(remainingSeconds)} restants`}
      />

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Durades ràpides">
        {durations.map((duration) => (
          <button
            key={duration}
            type="button"
            aria-pressed={durationSeconds === duration * 60}
            onClick={() => selectDuration(duration)}
            className={cn(
              "tap-target rounded-full border px-4 text-sm font-bold",
              durationSeconds === duration * 60 ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {duration} min
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          onClick={() => {
            setIsRunning((current) => !current);
            setCompleted(false);
            notifiedRef.current = false;
          }}
          disabled={remainingSeconds === 0}
        >
          {isRunning ? <Pause aria-hidden="true" className="h-5 w-5" /> : <Play aria-hidden="true" className="h-5 w-5" />}
          {isRunning ? "Pausar" : "Iniciar"}
        </Button>
        <Button variant="secondary" onClick={reset}>
          <RotateCcw aria-hidden="true" className="h-5 w-5" />
          Reiniciar
        </Button>
      </div>
    </Card>
  );
}
