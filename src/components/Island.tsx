import { AnimatePresence, motion } from "motion/react";

export type IslandState =
  | { kind: "idle" }
  | { kind: "typing"; field: string }
  | { kind: "caps" }
  | { kind: "strength"; score: number }
  | { kind: "error"; message: string }
  | { kind: "loading" }
  | { kind: "success"; name: string }
  | { kind: "info"; message: string };

const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["#ff453a", "#ff453a", "#ff9f0a", "#ffd60a", "#30d158"];

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;

/** A morphing pill inspired by Dynamic Island that narrates the form state. */
export function Island({ state }: { state: IslandState }) {
  const wide = state.kind !== "idle";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <motion.div
        layout
        transition={spring}
        className="flex h-9 items-center overflow-hidden rounded-full bg-black text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
        style={{ minWidth: wide ? 260 : 120, paddingInline: 14 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={state.kind}
            initial={{ opacity: 0, filter: "blur(6px)", scale: 0.9 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(6px)", scale: 0.9 }}
            transition={{ duration: 0.22 }}
            className="flex w-full items-center justify-between gap-3 text-[13px] font-medium"
          >
            {render(state)}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />;
}

function render(s: IslandState) {
  switch (s.kind) {
    case "idle":
      return (
        <>
          <Dot color="#30d158" />
          <span className="text-white/70">Secure</span>
        </>
      );
    case "typing":
      return (
        <>
          <span className="text-white/70">Editing {s.field}</span>
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-white"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </span>
        </>
      );
    case "caps":
      return (
        <>
          <span>⇪ Caps Lock is on</span>
          <Dot color="#ff9f0a" />
        </>
      );
    case "strength":
      return (
        <>
          <span style={{ color: strengthColor[s.score] }}>{strengthLabel[s.score]}</span>
          <span className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-6 rounded-full"
                animate={{ background: i <= s.score ? strengthColor[s.score] : "rgba(255,255,255,0.15)" }}
              />
            ))}
          </span>
        </>
      );
    case "error":
      return (
        <>
          <span className="truncate">{s.message}</span>
          <Dot color="#ff453a" />
        </>
      );
    case "info":
      return (
        <>
          <span className="truncate">{s.message}</span>
          <Dot color="#0a84ff" />
        </>
      );
    case "loading":
      return (
        <>
          <span>Signing in…</span>
          <motion.span
            className="size-4 rounded-full border-2 border-white/25 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </>
      );
    case "success":
      return (
        <>
          <span>Welcome, {s.name}</span>
          <svg viewBox="0 0 24 24" className="size-5">
            <motion.path
              d="M5 12.5 10 17 19 7"
              fill="none"
              stroke="#30d158"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4 }}
            />
          </svg>
        </>
      );
  }
}
