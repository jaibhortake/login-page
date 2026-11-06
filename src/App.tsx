import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from "react";
import { Backdrop } from "./components/Backdrop";
import { Field } from "./components/Field";
import { Island, type IslandState } from "./components/Island";

type Errors = { username?: string; password?: string };

function scorePassword(v: string) {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
  return Math.max(1, s);
}

function validate(username: string, password: string): Errors {
  const e: Errors = {};
  if (!username.trim()) e.username = "Enter your username or email.";
  else if (username.trim().length < 3) e.username = "Must be at least 3 characters.";
  if (!password) e.password = "Enter your password.";
  else if (password.length < 6) e.password = "Must be at least 6 characters.";
  return e;
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
    } catch { /* storage unavailable */ }
    return matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);
  const toggle = () => {
    const flip = () => setDark((d) => !d);
    // View Transitions API: smooth cross-fade where supported
    if (document.startViewTransition) document.startViewTransition(flip);
    else flip();
  };
  return { dark, toggle };
}

export default function App() {
  const { dark, toggle } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [island, setIsland] = useState<IslandState>({ kind: "idle" });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [passkey, setPasskey] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resetTimer = useRef<number>(undefined);

  // detect Face ID / Touch ID / Windows Hello availability
  useEffect(() => {
    window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.()
      .then(setPasskey)
      .catch(() => setPasskey(false));
  }, []);

  const flash = (s: IslandState, ms = 2600) => {
    setIsland(s);
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setIsland({ kind: "idle" }), ms);
  };

  // subtle 3D tilt that follows the pointer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const [shake, setShake] = useState(0);

  const onCaps = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState("CapsLock")) setIsland({ kind: "caps" });
    else if (island.kind === "caps") setIsland({ kind: "strength", score: scorePassword(password) });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(username, password);
    setErrors(errs);
    if (errs.username || errs.password) {
      setShake((n) => n + 1);
      flash({ kind: "error", message: errs.username ?? errs.password! });
      formRef.current?.querySelector<HTMLInputElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setStatus("loading");
    setIsland({ kind: "loading" });
    // Replace this with a real request to your backend, e.g. fetch("/login", { method: "POST", body })
    await new Promise((r) => setTimeout(r, 1400));
    setStatus("success");
    flash({ kind: "success", name: username.split("@")[0] }, 4000);
    setTimeout(() => setStatus("idle"), 4000);
  };

  const signInWithPasskey = () =>
    flash({ kind: "info", message: passkey ? "Passkey ready — connect your WebAuthn backend" : "No passkey device found" });

  return (
    <>
      <Backdrop />
      <Island state={island} />

      <button
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed right-4 top-3 z-50 grid size-10 place-items-center rounded-full border border-black/10 bg-white/60 backdrop-blur-xl transition hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/10"
      >
        <motion.svg key={String(dark)} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} viewBox="0 0 24 24" className="size-5" fill="currentColor">
          {dark ? (
            <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5 1 3h-2l1-3Zm0 20-1-3h2l-1 3ZM2 12l3-1v2l-3-1Zm20 0-3 1v-2l3 1ZM4.9 4.9l2.8 1.4-1.4 1.4-1.4-2.8Zm14.2 14.2-2.8-1.4 1.4-1.4 1.4 2.8Zm0-14.2-1.4 2.8-1.4-1.4 2.8-1.4ZM4.9 19.1l1.4-2.8 1.4 1.4-2.8 1.4Z" />
          ) : (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          )}
        </motion.svg>
      </button>

      <main className="grid min-h-dvh place-items-center px-4 py-20" style={{ perspective: 1200 }} onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0); }}>
        <motion.section
          initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{ rotateX: rotX, rotateY: rotY }}
          className="glass-edge relative w-full max-w-[420px] rounded-[32px] border border-white/40 bg-white/55 p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150 sm:p-10 dark:border-white/10 dark:bg-neutral-900/50 dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
        >
          <motion.div key={shake} animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined} transition={{ duration: 0.45 }}>
            <header className="mb-8 text-center">
              <motion.img
                src="./favicon.svg"
                alt=""
                className="mx-auto mb-5 size-14 rounded-2xl shadow-lg shadow-accent-2/30"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <h1 className="text-3xl font-semibold tracking-tight">Welcome back.</h1>
              <p className="mt-2 text-[15px] text-neutral-500 dark:text-neutral-400">Sign in to pick up where you left off.</p>
            </header>

            <button
              type="button"
              onClick={signInWithPasskey}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 text-[15px] font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2M9 9v1M15 9v1M12 9v4h-1M9 16s1 1 3 1 3-1 3-1" />
              </svg>
              Sign in with Passkey
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-neutral-500">
              <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              or use your password
              <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            </div>

            <form ref={formRef} onSubmit={submit} noValidate className="space-y-4" action="/login" method="post">
              <Field
                label="Username or email"
                name="username"
                autoComplete="username webauthn"
                value={username}
                error={errors.username}
                onChange={(e) => { setUsername(e.target.value); setErrors((x) => ({ ...x, username: undefined })); setIsland({ kind: "typing", field: "username" }); }}
                onBlur={() => setIsland({ kind: "idle" })}
              />
              <Field
                label="Password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                error={errors.password}
                onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); setIsland({ kind: "strength", score: scorePassword(e.target.value) }); }}
                onKeyUp={onCaps}
                onBlur={() => setIsland({ kind: "idle" })}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    className="grid size-9 place-items-center rounded-xl text-neutral-500 transition hover:text-accent"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                      {show && <path d="M3 3l18 18" strokeLinecap="round" />}
                    </svg>
                  </button>
                }
              />

              <div className="flex items-center justify-between pt-1 text-sm">
                <label className="flex cursor-pointer select-none items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={remember}
                    onClick={() => setRemember((r) => !r)}
                    className={`relative h-6 w-10 rounded-full transition-colors ${remember ? "bg-[#30d158]" : "bg-black/15 dark:bg-white/20"}`}
                  >
                    <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${remember ? "right-0.5" : "left-0.5"}`} />
                  </button>
                  Remember me
                  <input type="hidden" name="remember" value={String(remember)} />
                </label>
                <a href="#forgot" className="font-medium text-accent hover:underline">Forgot password?</a>
              </div>

              <motion.button
                type="submit"
                disabled={status !== "idle"}
                whileTap={{ scale: 0.98 }}
                className="relative mt-2 h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent-2 text-[15px] font-semibold text-white shadow-lg shadow-accent/30 transition hover:shadow-accent/50 disabled:cursor-default"
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/25"
                  animate={{ left: ["-35%", "135%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
                />
                <span className="relative">
                  {status === "loading" ? "Signing in…" : status === "success" ? "Signed in ✓" : "Continue"}
                </span>
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-500">
              New here?{" "}
              <a href="#register" className="font-medium text-accent hover:underline">Create an account</a>
            </p>
          </motion.div>
        </motion.section>
      </main>
    </>
  );
}
