import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

/** Slow-moving mesh gradient plus a soft spotlight that follows the pointer. */
export function Backdrop() {
  const x = useMotionValue(50);
  const y = useMotionValue(40);
  const sx = useSpring(x, { stiffness: 60, damping: 20 });
  const sy = useSpring(y, { stiffness: 60, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${sx}% ${sy}%, rgba(10,132,255,0.22), transparent 60%)`;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set((e.clientX / innerWidth) * 100);
      y.set((e.clientY / innerHeight) * 100);
    };
    addEventListener("pointermove", move);
    return () => removeEventListener("pointermove", move);
  }, [x, y]);

  const blobs = [
    { c: "#5e5ce6", cls: "-left-[10%] -top-[15%] size-[55vmax]", d: 22 },
    { c: "#30d5c8", cls: "-bottom-[20%] -right-[10%] size-[50vmax]", d: 26 },
    { c: "#bf5af2", cls: "left-[35%] top-[45%] size-[35vmax]", d: 30 },
  ];

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 blur-[90px] opacity-50 dark:opacity-40">
        {blobs.map((b, i) => (
          <motion.span
            key={i}
            className={`absolute rounded-full ${b.cls}`}
            style={{ background: b.c }}
            animate={{ x: ["0vw", "8vw", "-5vw", "0vw"], y: ["0vh", "6vh", "10vh", "0vh"], scale: [1, 1.12, 0.92, 1] }}
            transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />
      {/* fine grain for a premium, non-banded finish */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
